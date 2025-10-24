"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { Memo, Category } from "./types/memo";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useMemosQuery } from "./hooks/useMemosQuery";
import { MemoItem } from "./components/MemoItem";
import { UsernameInput } from "./components/UsernameInput";
import { useUser } from "./contexts/UserContext";
import { FeedbackModal } from "./components/FeedbackModal";
import { FeedbackService } from "./lib/feedback";
import { FeedbackSubmission } from "./types/feedback";
import { AppHeader } from "./components/layout/AppHeader";
import { RandomMemoModal } from "./components/RandomMemoModal";
import { TextInputModal } from "./components/TextInputModal";
import { SearchModal } from "./components/SearchModal";
import { RecordingOverlay } from "./components/RecordingOverlay";

// Helper component for search result items
export default function Home() {
  const { username, isLoading: userLoading } = useUser();
  const [filter, setFilter] = useState<
    "all" | "review" | "archive" | "starred"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sizeFilter, setSizeFilter] = useState<"S" | "M" | "L" | "all">("all");

  // React Query for memos
  const {
    data: memos = [],
    isLoading: loading,
    refetch: refetchMemos,
  } = useMemosQuery({
    username: username || "",
    filter,
    categoryFilter,
    sizeFilter,
  });
  const [newMemoId, setNewMemoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showRandomMemo, setShowRandomMemo] = useState(false);
  const [randomMemo, setRandomMemo] = useState<Memo | null>(null);
  const [openDropdown, setOpenDropdown] = useState<
    "view" | "category" | "size" | null
  >(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Memo[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    isRecording,
    isProcessing,
    error: voiceError,
    memoId: voiceMemoId,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscription,
  } = useVoiceRecorder(username || undefined);

  // React Query handles loading and caching automatically

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        openDropdown &&
        !(event.target as Element).closest(".dropdown-container")
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openDropdown]);

  // Reload memos when processing completes (new memo saved)
  useEffect(() => {
    if (!isProcessing && !isRecording && !voiceError && voiceMemoId) {
      // Small delay to ensure Supabase has the new record
      const timer = setTimeout(() => {
        setNewMemoId(voiceMemoId);
        refetchMemos();
        clearTranscription();
        // Clear highlight after animation (longer to allow smooth fade)
        setTimeout(() => setNewMemoId(null), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    isProcessing,
    isRecording,
    voiceError,
    voiceMemoId,
    refetchMemos,
    clearTranscription,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Edit memo functions
  const startEdit = useCallback((memo: Memo) => {
    setEditingId(memo.id);
    setEditText(memo.transcript);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText("");
  }, []);

  const saveEdit = useCallback(
    async (memoId: string) => {
      try {
        // Refetch memos to get updated data
        refetchMemos();

        setSearchResults((prev) =>
          prev.map((m) =>
            m.id === memoId ? { ...m, transcript: editText } : m
          )
        );

        const { error } = await supabase
          .from("memos")
          .update({ transcript: editText })
          .eq("id", memoId);

        if (error) throw error;

        setEditingId(null);
        setEditText("");
        refetchMemos();
      } catch (err) {
        console.error("Error updating memo:", err);
        // Revert optimistic update on error
        refetchMemos();
      }
    },
    [editText, refetchMemos]
  );

  // Space bar to toggle recording, Escape to cancel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field or textarea
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Don't trigger if a button is focused (to avoid conflict with button's Space activation)
      const isButton = target.tagName === "BUTTON" || target.closest("button");

      if (e.code === "Space" && !isInputField && !isButton) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isProcessing) {
          startRecording();
        }
      }

      // Escape to cancel recording (stops without saving)
      if (e.code === "Escape" && isRecording) {
        e.preventDefault();
        cancelRecording();
      }

      // Escape to cancel editing
      if (e.code === "Escape" && editingId) {
        e.preventDefault();
        cancelEdit();
      }

      // Escape to close random memo modal
      if (e.code === "Escape" && showRandomMemo) {
        e.preventDefault();
        setShowRandomMemo(false);
      }

      // Escape to close text input modal
      if (e.code === "Escape" && showTextInput) {
        e.preventDefault();
        setShowTextInput(false);
        setTextInput("");
      }

      // Escape to close search modal
      if (e.code === "Escape" && showSearch) {
        e.preventDefault();
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    isRecording,
    isProcessing,
    editingId,
    showRandomMemo,
    showTextInput,
    showSearch,
    startRecording,
    stopRecording,
    cancelRecording,
    cancelEdit,
  ]);

  // Handle dropdown interactions - close on click outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dropdown = target.closest(".group");

      // If click is outside any dropdown group, close all dropdowns
      if (!dropdown && openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  // Prevent background scrolling when any modal is open
  useEffect(() => {
    const anyModalOpen =
      showTextInput ||
      showSearch ||
      isRecording ||
      showRandomMemo ||
      showFeedback;

    if (anyModalOpen) {
      // Store original overflow style
      const originalOverflow = document.body.style.overflow;
      // Prevent scrolling
      document.body.style.overflow = "hidden";

      return () => {
        // Restore original overflow when modal closes
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showTextInput, showSearch, isRecording, showRandomMemo, showFeedback]);

  // Soft delete (move to archive)
  const softDelete = async (memoId: string) => {
    // Refetch memos to get updated data
    refetchMemos();
    // Also remove from search results
    setSearchResults((prev) => prev.filter((m) => m.id !== memoId));

    // Fire and forget - just update in background
    supabase
      .from("memos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", memoId)
      .then(({ error }) => {
        if (error) console.error("Error archiving memo:", error);
      });
  };

  // Toggle starred status
  const toggleStar = async (memoId: string, currentStarred: boolean) => {
    // Refetch memos to get updated data
    refetchMemos();

    // Also update search results if they exist
    setSearchResults((prev) =>
      prev.map((m) =>
        m.id === memoId ? { ...m, starred: !currentStarred } : m
      )
    );

    // Fire and forget - just update in background
    supabase
      .from("memos")
      .update({ starred: !currentStarred })
      .eq("id", memoId)
      .then(({ error }) => {
        if (error) console.error("Error toggling star:", error);
      });
  };

  // Change category with feedback tracking
  const handleCategoryChange = async (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => {
    // Refetch memos to get updated data
    refetchMemos();

    setSearchResults((prev) =>
      prev.map((m) => (m.id === memoId ? { ...m, category: newCategory } : m))
    );

    // Get the memo for its transcript
    const memo = memos.find((m) => m.id === memoId);

    // Fire and forget - update in background
    supabase
      .from("memos")
      .update({ category: newCategory })
      .eq("id", memoId)
      .then(({ error }) => {
        if (error) console.error("Error updating category:", error);
      });

    // Log feedback for AI improvement
    supabase
      .from("category_feedback")
      .insert({
        memo_id: memoId,
        transcript: memo?.transcript || "",
        original_category: oldCategory,
        corrected_category: newCategory,
        confidence: memo?.confidence || 0,
      })
      .then(({ error }) => {
        if (error) {
          console.warn("Failed to log feedback:", error);
        } else {
          console.log("✅ Category changed:", {
            memoId,
            from: oldCategory,
            to: newCategory,
            timestamp: new Date().toISOString(),
          });
        }
      });
  };

  // Restore from archive
  const restoreMemo = async (memoId: string) => {
    // Refetch memos to get updated data
    refetchMemos();

    // Fire and forget - just update in background
    supabase
      .from("memos")
      .update({ deleted_at: null })
      .eq("id", memoId)
      .then(({ error }) => {
        if (error) console.error("Error restoring memo:", error);
      });
  };

  // Hard delete (permanent)
  const hardDelete = async (memoId: string) => {
    if (!confirm("Permanently delete this memo? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.from("memos").delete().eq("id", memoId);

      if (error) throw error;
      refetchMemos();
    } catch (err) {
      console.error("Error permanently deleting memo:", err);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  // Handle text input submission (similar to voice recording but skips audio step)
  const handleTextSubmit = async () => {
    if (!textInput.trim() || isProcessingText || !username) return;

    setIsProcessingText(true);
    try {
      // Call the transcription API but pass text directly instead of audio
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textInput.trim(),
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      const result = await response.json();

      // Add to memos with optimistic update
      const newMemo: Memo = {
        id: result.memo_id || crypto.randomUUID(),
        transcript: textInput.trim(),
        category: result.category,
        confidence: result.confidence,
        needs_review: result.needs_review,
        extracted: result.extracted,
        tags: result.tags || [],
        starred: result.starred || false,
        size: result.size || null,
        timestamp: new Date(),
        deleted_at: null,
        source: "app",
        input_type: "text",
      };

      // Refetch memos to get updated data
      refetchMemos();
      setNewMemoId(newMemo.id);

      // Clear and close
      setTextInput("");
      setShowTextInput(false);

      // Clear the highlight after a delay
      setTimeout(() => setNewMemoId(null), 3000);
    } catch (error) {
      console.error("Error processing text:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessingText(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: FeedbackSubmission) => {
    try {
      await FeedbackService.submitFeedback(feedback);
      // Could show a success toast here
      console.log("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Could show an error toast here
      throw error;
    }
  };

  // Handle search functionality
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const lowercaseQuery = query.toLowerCase();
      const filtered = memos.filter((memo) => {
        // Search in transcript (full text)
        if (memo.transcript.toLowerCase().includes(lowercaseQuery)) return true;

        // Search in extracted summary
        if (memo.extracted?.what?.toLowerCase().includes(lowercaseQuery))
          return true;

        // Search in extracted title
        if (memo.extracted?.title?.toLowerCase().includes(lowercaseQuery))
          return true;

        // Search in people mentioned
        if (
          memo.extracted?.who?.some((person) =>
            person.toLowerCase().includes(lowercaseQuery)
          )
        )
          return true;

        // Search in tags
        if (
          memo.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
        )
          return true;

        // Search in category
        if (memo.category.toLowerCase().includes(lowercaseQuery)) return true;

        return false;
      });

      setSearchResults(filtered);
    },
    [memos]
  );

  // Pick a random memo (prioritize actionable, todos, needs review)
  const pickRandomMemo = async () => {
    try {
      // Fetch active memos with priority
      const { data: priorityMemos } = await supabase
        .from("memos")
        .select("*")
        .is("deleted_at", null)
        .or(
          "needs_review.eq.true,category.eq.todo,extracted->>actionable.eq.true"
        )
        .order("timestamp", { ascending: false });

      // If no priority memos, get all active memos
      let memosToChooseFrom = priorityMemos || [];
      if (memosToChooseFrom.length === 0) {
        const { data: allMemos } = await supabase
          .from("memos")
          .select("*")
          .is("deleted_at", null);
        memosToChooseFrom = allMemos || [];
      }

      if (memosToChooseFrom.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * memosToChooseFrom.length
        );
        setRandomMemo(memosToChooseFrom[randomIndex]);
        setShowRandomMemo(true);
      }
    } catch (err) {
      console.error("Error fetching random memo:", err);
    }
  };

  return (
    <>
      {/* Show username input if user is not set */}
      {!userLoading && !username && <UsernameInput />}

      {/* Main app content - only show if username is set */}
      {username && (
        <div className="min-h-screen p-3 sm:p-4 md:p-8 safe-y relative overflow-hidden select-none">
          {/* Recording/Processing Overlay */}
          <RecordingOverlay
            isRecording={isRecording}
            isProcessing={isProcessing}
            recordingTime={recordingTime}
            onStopRecording={handleRecordClick}
            formatTime={formatTime}
          />

          <div className="max-w-5xl mx-auto relative z-10">
            <AppHeader
              onRandomMemo={pickRandomMemo}
              onSearch={() => setShowSearch(true)}
              onTextInput={() => setShowTextInput(true)}
              isRecording={isRecording}
              isProcessing={isProcessing}
              isProcessingText={isProcessingText}
              setShowFeedback={setShowFeedback}
              handleRecordClick={handleRecordClick}
              voiceError={voiceError}
              filter={filter}
              setFilter={setFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sizeFilter={sizeFilter}
              setSizeFilter={setSizeFilter}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            {/* Loading State */}
            {loading && (
              <div
                className="py-12 text-center"
                role="status"
                aria-live="polite"
              >
                <div
                  className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"
                  aria-hidden="true"
                ></div>
                <p className="mt-4 text-[#94a3b8] text-sm">Loading memos...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && memos.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
                    <svg
                      className="w-10 h-10 text-indigo-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl text-[#cbd5e1] mb-2">No memos yet</h3>
                <p className="text-[#64748b] mb-6">
                  {filter === "review" ? (
                    "No memos need review! 🎉"
                  ) : categoryFilter !== "all" ? (
                    `No ${categoryFilter} memos yet`
                  ) : (
                    <>
                      <span className="hidden sm:inline">
                        Click the record button or press Space to create your
                        first memo
                      </span>
                      <span className="sm:hidden">
                        Click the record button to create your first memo
                      </span>
                    </>
                  )}
                </p>
                <button
                  onClick={handleRecordClick}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Record Your First Memo
                </button>
              </div>
            )}

            {/* Memos List */}
            {!loading && memos.length > 0 && (
              <div className="space-y-4">
                {memos.map((memo) => {
                  const isNew = memo.id === newMemoId;

                  return (
                    <MemoItem
                      key={memo.id}
                      memo={memo}
                      isNew={isNew}
                      filter={filter}
                      editingId={editingId}
                      editText={editText}
                      setEditText={setEditText}
                      startEdit={startEdit}
                      cancelEdit={cancelEdit}
                      saveEdit={saveEdit}
                      softDelete={softDelete}
                      toggleStar={toggleStar}
                      restoreMemo={restoreMemo}
                      hardDelete={hardDelete}
                      onCategoryChange={handleCategoryChange}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Random Memo Modal */}
          <RandomMemoModal
            isOpen={showRandomMemo}
            memo={randomMemo}
            onClose={() => setShowRandomMemo(false)}
            onShowAnother={pickRandomMemo}
          />

          {/* Text Input Modal */}
          <TextInputModal
            isOpen={showTextInput}
            value={textInput}
            onChange={setTextInput}
            onClose={() => setShowTextInput(false)}
            onSubmit={handleTextSubmit}
            isProcessing={isProcessingText}
          />

          {/* Search Modal */}
          <SearchModal
            isOpen={showSearch}
            searchQuery={searchQuery}
            searchResults={searchResults}
            onSearch={handleSearch}
            onClose={() => {
              setShowSearch(false);
              setSearchQuery("");
              setSearchResults([]);
            }}
            editingId={editingId}
            editText={editText}
            setEditText={setEditText}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            saveEdit={saveEdit}
            softDelete={softDelete}
            toggleStar={toggleStar}
            restoreMemo={restoreMemo}
            hardDelete={hardDelete}
            onCategoryChange={handleCategoryChange}
          />

          {/* Feedback Modal */}
          <FeedbackModal
            isOpen={showFeedback}
            onClose={() => setShowFeedback(false)}
            onSubmit={handleFeedbackSubmit}
          />
        </div>
      )}
    </>
  );
}
