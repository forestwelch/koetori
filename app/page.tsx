"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { RandomMemoModal } from "./components/RandomMemoModal";
import { TextInputModal } from "./components/TextInputModal";
import { SearchModal } from "./components/SearchModal";
import { RecordingOverlay } from "./components/RecordingOverlay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { FilterCommandPalette } from "./components/FilterCommandPalette";
import { MobileFooter } from "./components/MobileFooter";
import { SettingsModal } from "./components/SettingsModal";
import { Search, Type, Settings, Mic } from "lucide-react";
import { Button } from "./components/ui/Button";
import { ActionButton } from "./components/ActionButton";
import { QuickFilters } from "./components/QuickFilters";

// Helper component for search result items
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { username, isLoading: userLoading } = useUser();

  // Initialize filters from URL params
  const [filter, setFilterState] = useState<
    "all" | "review" | "archive" | "starred"
  >(
    (searchParams.get("view") as "all" | "review" | "archive" | "starred") ||
      "all"
  );
  const [categoryFilter, setCategoryFilterState] = useState<Category | "all">(
    (searchParams.get("type") as Category | "all") || "all"
  );
  const [sizeFilter, setSizeFilterState] = useState<"S" | "M" | "L" | "all">(
    (searchParams.get("size") as "S" | "M" | "L" | "all") || "all"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Update URL when filters change
  const updateURL = useCallback(
    (view: string, type: string, size: string) => {
      const params = new URLSearchParams();
      if (view !== "all") params.set("view", view);
      if (type !== "all") params.set("type", type);
      if (size !== "all") params.set("size", size);

      const query = params.toString();
      router.push(query ? `?${query}` : "/", { scroll: false });
    },
    [router]
  );

  // Wrapper functions that update both state and URL
  const setFilter = useCallback(
    (newFilter: "all" | "review" | "archive" | "starred") => {
      setFilterState(newFilter);
      updateURL(newFilter, categoryFilter, sizeFilter);
    },
    [categoryFilter, sizeFilter, updateURL]
  );

  const setCategoryFilter = useCallback(
    (newCategory: Category | "all") => {
      setCategoryFilterState(newCategory);
      updateURL(filter, newCategory, sizeFilter);
    },
    [filter, sizeFilter, updateURL]
  );

  const setSizeFilter = useCallback(
    (newSize: "S" | "M" | "L" | "all") => {
      setSizeFilterState(newSize);
      updateURL(filter, categoryFilter, newSize);
    },
    [filter, categoryFilter, updateURL]
  );

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

  // Auto-expand when exactly 1 memo matches filters
  useEffect(() => {
    if (memos.length === 1 && !loading) {
      setExpandedId(memos[0].id);
    } else if (memos.length !== 1) {
      setExpandedId(null);
    }
  }, [memos, loading]);

  const [newMemoId, setNewMemoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showRandomMemo, setShowRandomMemo] = useState(false);
  const [randomMemo, setRandomMemo] = useState<Memo | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Memo[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isSpotlightMode, setIsSpotlightMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      const isButton =
        target.tagName === "BUTTON" ||
        (target instanceof Element && target.closest("button"));

      if (e.code === "Space" && !isInputField && !isButton) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isProcessing) {
          startRecording();
        }
      }

      // Escape to close command palette
      if (e.code === "Escape" && showCommandPalette) {
        e.preventDefault();
        setShowCommandPalette(false);
      }

      // Escape to cancel recording (higher priority than filter reset)
      if (e.code === "Escape" && isRecording) {
        e.preventDefault();
        cancelRecording();
        return;
      }

      // Escape priority order: modals first, then spotlight, then reset filters
      if (e.code === "Escape") {
        e.preventDefault();

        // Close modals first
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (isSpotlightMode) {
          setIsSpotlightMode(false);
          return;
        }
        if (editingId) {
          cancelEdit();
          return;
        }
        if (showRandomMemo) {
          setShowRandomMemo(false);
          return;
        }
        if (showTextInput) {
          setShowTextInput(false);
          setTextInput("");
          return;
        }
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
          setSearchResults([]);
          return;
        }
        if (showCommandPalette) {
          setShowCommandPalette(false);
          return;
        }

        // If nothing is open, reset all filters to "all"
        setFilter("all");
        setCategoryFilter("all");
        setSizeFilter("all");
      }

      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !isInputField) {
        e.preventDefault();
        setShowSearch(true);
      }

      // Cmd/Ctrl + P for filter command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "p" && !isInputField) {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Cmd/Ctrl + L for spotlight mode
      if ((e.metaKey || e.ctrlKey) && e.key === "l" && !isInputField) {
        e.preventDefault();
        setIsSpotlightMode(!isSpotlightMode);
      }

      // Filter shortcuts work globally when not typing (and close spotlight if open)
      if (!isInputField && !e.metaKey && !e.ctrlKey) {
        // View filters: Q, W, E, R
        if (e.key === "q") {
          e.preventDefault();
          setFilter("all");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "w") {
          e.preventDefault();
          setFilter("starred");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "e") {
          e.preventDefault();
          setFilter("review");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "r") {
          e.preventDefault();
          setFilter("archive");
          setIsSpotlightMode(false);
          return;
        }
        // Category filters: A, S, D, F, G, H, J, K, L, ;
        else if (e.key === "a") {
          e.preventDefault();
          setCategoryFilter("all");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "s") {
          e.preventDefault();
          setCategoryFilter("media");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "d") {
          e.preventDefault();
          setCategoryFilter("event");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "f") {
          e.preventDefault();
          setCategoryFilter("journal");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "g") {
          e.preventDefault();
          setCategoryFilter("therapy");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "h") {
          e.preventDefault();
          setCategoryFilter("tarot");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "j") {
          e.preventDefault();
          setCategoryFilter("todo");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "k") {
          e.preventDefault();
          setCategoryFilter("idea");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "l") {
          e.preventDefault();
          setCategoryFilter("to buy");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === ";") {
          e.preventDefault();
          setCategoryFilter("other");
          setIsSpotlightMode(false);
          return;
        }
        // Size filters: Z, X, C, V
        else if (e.key === "z") {
          e.preventDefault();
          setSizeFilter("all");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "x") {
          e.preventDefault();
          setSizeFilter("S");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "c") {
          e.preventDefault();
          setSizeFilter("M");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "v") {
          e.preventDefault();
          setSizeFilter("L");
          setIsSpotlightMode(false);
          return;
        }
      }

      // Cmd+1/2/3 for quick "All" filters
      if (!isInputField && (e.metaKey || e.ctrlKey)) {
        if (e.key === "1") {
          e.preventDefault();
          setFilter("all");
          setIsSpotlightMode(false);
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          setCategoryFilter("all");
          setIsSpotlightMode(false);
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          setSizeFilter("all");
          setIsSpotlightMode(false);
          return;
        }
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
    showCommandPalette,
    isSpotlightMode,
    showSettings,
    startRecording,
    stopRecording,
    cancelRecording,
    cancelEdit,
    setFilter,
    setCategoryFilter,
    setSizeFilter,
  ]);

  // Prevent background scrolling when any modal is open
  useEffect(() => {
    const anyModalOpen =
      showTextInput ||
      showSearch ||
      isRecording ||
      showRandomMemo ||
      showFeedback ||
      showCommandPalette ||
      isSpotlightMode ||
      showSettings;

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
  }, [
    showTextInput,
    showSearch,
    isRecording,
    showRandomMemo,
    showFeedback,
    showCommandPalette,
    showSettings,
    isSpotlightMode,
  ]);

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
        // Silently log feedback - non-critical operation
        if (error) {
          // Feedback logging failed, but don't interrupt user flow
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
      // Success - feedback submitted
      // TODO: Show success toast notification
    } catch (error) {
      // TODO: Show error toast notification instead of console.error
      console.error("Error submitting feedback:", error);
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
          {/* Spotlight Mode - 3 layer effect */}
          {isSpotlightMode && (
            <>
              {/* Layer 1: Dim everything (bottom layer) */}
              <div className="fixed inset-0 z-[5] bg-black/40 transition-all duration-300 pointer-events-none" />

              {/* Layer 2: Semi-transparent mask (middle layer) - clickable to close */}
              <div
                className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm transition-all duration-300"
                onClick={() => setIsSpotlightMode(false)}
              />
            </>
          )}

          {/* Recording/Processing Overlay */}
          <RecordingOverlay
            isRecording={isRecording}
            isProcessing={isProcessing}
            recordingTime={recordingTime}
            onStopRecording={handleRecordClick}
            formatTime={formatTime}
          />

          {/* Header - Title and Action Buttons */}
          <div className="max-w-5xl mx-auto relative z-10 mb-8">
            <div className="flex items-center justify-between">
              <h1
                onClick={pickRandomMemo}
                className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
              >
                koetori
              </h1>

              {/* Right side: Action buttons */}
              <div className="flex items-center gap-3">
                {/* Status indicators */}
                {isProcessingText && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                  </div>
                )}
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="hidden sm:inline">Recording...</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                  </div>
                )}

                {/* Settings button - Mobile only */}
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="unstyled"
                  size="custom"
                  aria-label="Settings"
                  className="lg:hidden text-slate-400 hover:text-white transition-all p-2 rounded-lg bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                {/* Action buttons */}
                <ActionButton
                  onClick={() => setShowSearch(true)}
                  disabled={isProcessing || isProcessingText}
                  icon={<Search className="w-6 h-6 text-white" />}
                  ariaLabel="Search memos"
                  title="Search memos"
                  gradient="bg-gradient-to-br from-orange-500 to-pink-500"
                  shadowColor="shadow-orange-500/50 hover:shadow-orange-500/70"
                  glowColor="bg-gradient-to-br from-orange-400 to-pink-400"
                />

                <ActionButton
                  onClick={() => setShowTextInput(true)}
                  disabled={isProcessing || isProcessingText}
                  icon={<Type className="w-6 h-6 text-white" />}
                  ariaLabel="Add text memo"
                  title="Add text memo"
                  gradient="bg-gradient-to-br from-emerald-500 to-cyan-500"
                  shadowColor="shadow-emerald-500/50 hover:shadow-emerald-500/70"
                  glowColor="bg-gradient-to-br from-emerald-400 to-cyan-400"
                />

                <ActionButton
                  onClick={handleRecordClick}
                  disabled={isProcessing || isProcessingText}
                  ariaLabel={isRecording ? "Stop recording" : "Start recording"}
                  title={isRecording ? "Stop recording" : "Start recording"}
                  gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
                  shadowColor="shadow-indigo-500/50 hover:shadow-indigo-500/70"
                  glowColor="bg-gradient-to-br from-indigo-400 to-purple-400"
                  isActive={isRecording}
                  activeColor="bg-red-500 shadow-red-500/50 hover:shadow-red-500/70"
                  icon={<Mic className="w-6 h-6 text-white" />}
                />
              </div>
            </div>

            {/* Recording Error */}
            {voiceError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{voiceError}</p>
              </div>
            )}
          </div>

          {/* Filters Section - Same width as memos */}
          <div className="max-w-5xl mx-auto relative z-50 mb-8">
            <QuickFilters
              filter={filter}
              setFilter={setFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sizeFilter={sizeFilter}
              setSizeFilter={setSizeFilter}
              isSpotlighted={isSpotlightMode}
              onFilterClick={() => setIsSpotlightMode(false)}
            />
          </div>

          {/* Content with subtle dimming to de-emphasize */}
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="opacity-60">
              {/* Loading State */}
              {loading && <LoadingSpinner message="Loading memos..." />}

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
                  <h3 className="text-xl text-[#cbd5e1] mb-2">
                    {filter !== "all" ||
                    categoryFilter !== "all" ||
                    sizeFilter !== "all"
                      ? "No matching memos"
                      : "No memos yet"}
                  </h3>
                  <p className="text-[#64748b] mb-6">
                    {filter !== "all" ||
                    categoryFilter !== "all" ||
                    sizeFilter !== "all" ? (
                      <>
                        No memos match these filters.{" "}
                        <button
                          onClick={() => {
                            setFilter("all");
                            setCategoryFilter("all");
                            setSizeFilter("all");
                          }}
                          className="text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Clear filters
                        </button>
                      </>
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
                        isExpanded={expandedId === memo.id}
                        onToggleExpand={() =>
                          setExpandedId(expandedId === memo.id ? null : memo.id)
                        }
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

          {/* Filter Command Palette */}
          <FilterCommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            setFilter={setFilter}
            setCategoryFilter={setCategoryFilter}
            setSizeFilter={setSizeFilter}
          />

          {/* Feedback Modal */}
          <FeedbackModal
            isOpen={showFeedback}
            onClose={() => setShowFeedback(false)}
            onSubmit={handleFeedbackSubmit}
          />

          {/* Settings Modal - Mobile only */}
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            setShowFeedback={setShowFeedback}
          />

          {/* Desktop Footer - Fixed bottom-right buttons */}
          <MobileFooter setShowFeedback={setShowFeedback} />
        </div>
      )}
    </>
  );
}
