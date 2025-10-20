"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { Memo, Category } from "./types/memo";
import {
  getCategoryColor,
  getCategoryGradient,
  getCategoryIcon,
  getCategoryLabel,
  formatConfidence,
} from "./lib/ui-utils";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { MemoItem } from "./components/MemoItem";
import { Star } from "lucide-react";

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "review" | "archive" | "starred"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sizeFilter, setSizeFilter] = useState<"S" | "M" | "L" | "all">("all");
  const [newMemoId, setNewMemoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showRandomMemo, setShowRandomMemo] = useState(false);
  const [randomMemo, setRandomMemo] = useState<Memo | null>(null);

  const {
    isRecording,
    isProcessing,
    error: recordingError,
    memoId,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscription,
  } = useVoiceRecorder();

  const loadMemos = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("memos")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filter === "archive") {
        query = query.not("deleted_at", "is", null);
      } else {
        query = query.is("deleted_at", null);

        if (filter === "review") {
          query = query.eq("needs_review", true);
        }

        if (filter === "starred") {
          query = query.eq("starred", true);
        }

        if (categoryFilter !== "all") {
          query = query.eq("category", categoryFilter);
        }

        if (sizeFilter !== "all") {
          query = query.eq("size", sizeFilter);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading memos:", error);
      } else {
        setMemos(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter, sizeFilter]);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // Reload memos when processing completes (new memo saved)
  useEffect(() => {
    if (!isProcessing && !isRecording && !recordingError && memoId) {
      // Small delay to ensure Supabase has the new record
      const timer = setTimeout(() => {
        setNewMemoId(memoId);
        loadMemos();
        clearTranscription();
        // Clear highlight after animation (longer to allow smooth fade)
        setTimeout(() => setNewMemoId(null), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    isProcessing,
    isRecording,
    recordingError,
    memoId,
    loadMemos,
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
        const { error } = await supabase
          .from("memos")
          .update({ transcript: editText })
          .eq("id", memoId);

        if (error) throw error;

        setEditingId(null);
        setEditText("");
        loadMemos();
      } catch (err) {
        console.error("Error updating memo:", err);
      }
    },
    [editText, loadMemos]
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

      if (e.code === "Space" && !isInputField) {
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
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    isRecording,
    isProcessing,
    editingId,
    showRandomMemo,
    startRecording,
    stopRecording,
    cancelRecording,
    cancelEdit,
  ]);

  // Soft delete (move to archive)
  const softDelete = async (memoId: string) => {
    // Optimistic update: remove from list if not in archive view
    if (filter !== "archive") {
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
    }

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
    // Optimistic update: toggle immediately
    setMemos((prev) =>
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
    // Optimistic update: change category immediately
    setMemos((prev) =>
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
    // Optimistic update: remove from archive view
    if (filter === "archive") {
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
    }

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
      loadMemos();
    } catch (err) {
      console.error("Error permanently deleting memo:", err);
    }
  };

  const categories: (Category | "all")[] = [
    "all",
    "media",
    "event",
    "journal",
    "therapy",
    "tarot",
    "todo",
    "idea",
    "to buy",
    "other",
  ];

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

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
    <div className="min-h-screen p-4 sm:p-8 relative overflow-hidden bg-[#0a0a0f] select-none">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />

      {/* Recording/Processing Overlay */}
      {(isRecording || isProcessing) && (
        <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center flex flex-col items-center">
            {isRecording ? (
              <>
                {/* Recording Animation */}
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="w-32 h-32 bg-red-500/20 rounded-full absolute animate-ping" />
                  <button
                    onClick={handleRecordClick}
                    className="relative w-32 h-32 bg-red-500 rounded-full shadow-2xl shadow-red-500/50 hover:bg-red-600 transition-all flex items-center justify-center"
                    aria-label="Stop recording"
                  >
                    <div className="w-12 h-12 bg-white rounded-sm" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 text-red-400 text-2xl font-medium">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Recording...
                  </div>
                  <div className="text-4xl font-light text-white tabular-nums">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-[#94a3b8] text-sm mt-2">
                    Press{" "}
                    <kbd className="px-2 py-1 bg-[#1e1f2a] rounded text-xs font-mono">
                      Space
                    </kbd>{" "}
                    to stop or{" "}
                    <kbd className="px-2 py-1 bg-[#1e1f2a] rounded text-xs font-mono">
                      Esc
                    </kbd>{" "}
                    to cancel
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Processing Animation */}
                <div className="w-32 h-32 border-8 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6" />
                <div className="flex flex-col items-center gap-3">
                  <div className="text-indigo-400 text-2xl font-medium">
                    Processing...
                  </div>
                  <p className="text-[#94a3b8] text-sm">
                    Transcribing and categorizing your memo
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header with Floating Record Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1
              onClick={pickRandomMemo}
              className="text-3xl sm:text-4xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            >
              koetori
            </h1>

            {/* Floating Record Button */}
            <div className="flex items-center gap-3">
              {/* Recording/Processing Status */}
              {isRecording && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  Recording...
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              )}

              <button
                onClick={handleRecordClick}
                disabled={isProcessing}
                className={`group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 shadow-red-500/50 hover:shadow-red-500/70 animate-pulse"
                    : isProcessing
                      ? "bg-gray-500 shadow-gray-500/50 cursor-not-allowed"
                      : "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105"
                }`}
                aria-label={
                  isRecording
                    ? "Stop recording (Space)"
                    : "Start recording (Space)"
                }
                title={
                  isRecording
                    ? "Stop recording (Space)"
                    : "Start recording (Space)"
                }
              >
                <div
                  className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${
                    isRecording
                      ? "bg-red-400 opacity-100"
                      : "bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100"
                  }`}
                />
                <div className="relative flex items-center justify-center">
                  {isRecording ? (
                    <div className="w-4 h-4 bg-white rounded-sm" />
                  ) : (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Recording Error */}
          {recordingError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{recordingError}</p>
            </div>
          )}

          {/* Filter Controls */}
          <div className="space-y-4">
            {/* Review Filter */}
            <div className="flex gap-3 flex-wrap">
              {/* All Memos Button */}
              <div className="relative">
                {filter === "all" && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-50 blur-sm" />
                )}
                <button
                  onClick={() => setFilter("all")}
                  className={`relative px-4 py-2 rounded-2xl text-sm font-medium transition-all backdrop-blur-xl ${
                    filter === "all"
                      ? "bg-indigo-500/30 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/20"
                      : "bg-[#0d0e14]/20 border border-slate-700/10 text-[#64748b] hover:border-slate-600/30 hover:bg-[#0d0e14]/40"
                  }`}
                >
                  All Memos
                </button>
              </div>
              {/* Starred Button */}
              <div className="relative">
                {filter === "starred" && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/50 to-yellow-500/50 opacity-50 blur-sm" />
                )}
                <button
                  onClick={() => setFilter("starred")}
                  className={`relative px-4 py-2 rounded-2xl text-sm font-medium transition-all backdrop-blur-xl flex items-center gap-2 ${
                    filter === "starred"
                      ? "bg-amber-500/30 text-white shadow-lg shadow-amber-500/30 border border-amber-400/20"
                      : "bg-[#0d0e14]/20 border border-slate-700/10 text-[#64748b] hover:border-slate-600/30 hover:bg-[#0d0e14]/40"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Starred
                </button>
              </div>
              {/* Needs Review Button */}
              <div className="relative">
                {filter === "review" && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/50 to-pink-500/50 opacity-50 blur-sm" />
                )}
                <button
                  onClick={() => setFilter("review")}
                  className={`relative px-4 py-2 rounded-2xl text-sm font-medium transition-all backdrop-blur-xl ${
                    filter === "review"
                      ? "bg-fuchsia-500/30 text-white shadow-lg shadow-fuchsia-500/30 border border-fuchsia-400/20"
                      : "bg-[#0d0e14]/20 border border-slate-700/10 text-[#64748b] hover:border-slate-600/30 hover:bg-[#0d0e14]/40"
                  }`}
                >
                  Needs Review
                </button>
              </div>
              {/* Archive Button */}
              <div className="relative">
                {filter === "archive" && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-500/50 to-gray-500/50 opacity-50 blur-sm" />
                )}
                <button
                  onClick={() => setFilter("archive")}
                  className={`relative px-4 py-2 rounded-2xl text-sm font-medium transition-all backdrop-blur-xl ${
                    filter === "archive"
                      ? "bg-slate-500/30 text-white shadow-lg shadow-slate-500/30 border border-slate-400/20"
                      : "bg-[#0d0e14]/20 border border-slate-700/10 text-[#64748b] hover:border-slate-600/30 hover:bg-[#0d0e14]/40"
                  }`}
                >
                  Archive
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = categoryFilter === cat;
                const isAllCategory = cat === "all";

                return (
                  <div key={cat} className="relative">
                    {/* Gradient glow for active state */}
                    {isActive && (
                      <div
                        className={`absolute inset-0 rounded-full opacity-50 blur-sm ${
                          isAllCategory
                            ? "bg-gradient-to-r from-slate-500/50 to-gray-500/50"
                            : `bg-gradient-to-r ${getCategoryGradient(cat as Category)}`
                        }`}
                      />
                    )}
                    <button
                      onClick={() => setCategoryFilter(cat)}
                      className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all backdrop-blur-xl border ${
                        isActive
                          ? isAllCategory
                            ? "bg-slate-500/30 text-white border-slate-500/20 shadow-lg shadow-slate-500/20"
                            : getCategoryColor(cat as Category).replace(
                                "border-",
                                "shadow-lg shadow-"
                              ) +
                              " " +
                              getCategoryColor(cat as Category)
                          : "bg-[#0d0e14]/20 border-slate-700/10 text-[#64748b] hover:border-slate-600/30 hover:bg-[#0d0e14]/40"
                      }`}
                    >
                      {isAllCategory
                        ? "All Categories"
                        : `${getCategoryIcon(cat as Category)} ${getCategoryLabel(cat as Category)}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Size Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#64748b] font-medium">Size:</span>
              {(["all", "S", "M", "L"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSizeFilter(size)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all backdrop-blur-xl border ${
                    sizeFilter === size
                      ? "bg-slate-500/30 text-white border-slate-500/40 shadow-lg shadow-slate-500/20"
                      : "bg-[#0d0e14]/20 border-slate-700/10 text-[#64748b] hover:border-slate-600/30 hover:bg-[#0d0e14]/40"
                  }`}
                >
                  {size === "all"
                    ? "All"
                    : `${size} ${size === "S" ? "(<5min)" : size === "M" ? "(<30min)" : "(>30min)"}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
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
              {filter === "review"
                ? "No memos need review! 🎉"
                : categoryFilter !== "all"
                  ? `No ${categoryFilter} memos yet`
                  : "Click the record button or press Space to create your first memo"}
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
      {showRandomMemo && randomMemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setShowRandomMemo(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl" />

          {/* Modal Content */}
          <div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[#0d0e14]/80 border border-slate-700/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowRandomMemo(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#1e1f2a]/60 hover:bg-[#1e1f2a] border border-slate-700/30 text-[#94a3b8] hover:text-white transition-all"
            >
              ✕
            </button>

            {/* Category & Confidence */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-xl border ${getCategoryColor(randomMemo.category)}`}
              >
                {getCategoryIcon(randomMemo.category)} {randomMemo.category}
              </div>
              <div className="text-[#64748b] text-sm">
                {formatConfidence(randomMemo.confidence)} confidence
              </div>
              {randomMemo.needs_review && (
                <span className="text-xs px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/40 rounded-full backdrop-blur-xl">
                  Needs Review
                </span>
              )}
            </div>

            {/* Transcript */}
            <div className="text-[#e2e8f0] text-lg leading-relaxed mb-6">
              {randomMemo.transcript}
            </div>

            {/* Timestamp */}
            <div className="text-[#64748b] text-sm mb-6">
              {new Date(randomMemo.timestamp).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>

            {/* Extracted Data */}
            {randomMemo.extracted && (
              <div className="space-y-3 p-4 bg-[#0a0a0f]/40 rounded-lg border border-slate-700/20 mb-6">
                <div className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">
                  Extracted Information
                </div>
                {randomMemo.extracted.title && (
                  <div>
                    <span className="text-[#64748b] font-medium">Title: </span>
                    <span className="text-[#cbd5e1]">
                      {randomMemo.extracted.title}
                    </span>
                  </div>
                )}
                {randomMemo.extracted.who && (
                  <div>
                    <span className="text-[#64748b] font-medium">Who: </span>
                    <span className="text-[#cbd5e1]">
                      {randomMemo.extracted.who}
                    </span>
                  </div>
                )}
                {randomMemo.extracted.when && (
                  <div>
                    <span className="text-[#64748b] font-medium">When: </span>
                    <span className="text-[#cbd5e1]">
                      {randomMemo.extracted.when}
                    </span>
                  </div>
                )}
                {randomMemo.extracted.where && (
                  <div>
                    <span className="text-[#64748b] font-medium">Where: </span>
                    <span className="text-[#cbd5e1]">
                      {randomMemo.extracted.where}
                    </span>
                  </div>
                )}
                {randomMemo.extracted.what && (
                  <div>
                    <span className="text-[#64748b] font-medium">
                      Summary:{" "}
                    </span>
                    <span className="text-[#cbd5e1]">
                      {randomMemo.extracted.what}
                    </span>
                  </div>
                )}
                {randomMemo.extracted.actionable && (
                  <div className="pt-1">
                    <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/40 rounded-full backdrop-blur-xl">
                      🎯 Actionable
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {randomMemo.tags && randomMemo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {randomMemo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-[#0a0a0f]/60 text-[#94a3b8] border border-slate-700/20 rounded-full text-xs backdrop-blur-xl"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={pickRandomMemo}
                className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/40 rounded-lg transition-all backdrop-blur-xl"
              >
                Show Another
              </button>
              <button
                onClick={() => setShowRandomMemo(false)}
                className="px-4 py-2 bg-[#1e1f2a]/60 hover:bg-[#1e1f2a] text-[#94a3b8] hover:text-white border border-slate-700/30 rounded-lg transition-all backdrop-blur-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
