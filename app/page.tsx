"use client";

import { useEffect, useCallback, useState } from "react";
import { supabase } from "./lib/supabase";
import { Memo } from "./types/memo";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useMemosQuery } from "./hooks/useMemosQuery";
import { useMemoOperations } from "./hooks/useMemoOperations";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSearch } from "./hooks/useSearch";
import { useUser } from "./contexts/UserContext";
import { useFilters } from "./contexts/FilterContext";
import { useModals } from "./contexts/ModalContext";
import { FeedbackService } from "./lib/feedback";
import { FeedbackSubmission } from "./types/feedback";

import { UsernameInput } from "./components/UsernameInput";
import { RecordingOverlay } from "./components/RecordingOverlay";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { MemosList } from "./components/MemosList";
import { ActionButtons } from "./components/ActionButtons";
import { ModalsContainer } from "./components/ModalsContainer";
import { QuickFilters } from "./components/QuickFilters";
import { SizeFilterShowcase } from "./components/SizeFilterShowcase";
import { FiltersDrawer } from "./components/FiltersDrawer";
import { KoetoriExplanation } from "./components/KoetoriExplanation";
import { Filter, Star, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);

  const { username, isLoading: userLoading } = useUser();
  const {
    categoryFilter,
    sizeFilter,
    starredOnly,
    setCategoryFilter,
    setSizeFilter,
    setStarredOnly,
    isSpotlightMode,
    setIsSpotlightMode,
  } = useFilters();

  const {
    setShowRandomMemo,
    setRandomMemo,
    setTextInput,
    setShowTextInput,
    isProcessingText,
    setIsProcessingText,
  } = useModals();

  // React Query for memos
  const {
    data: memos = [],
    isLoading: loading,
    refetch: refetchMemos,
  } = useMemosQuery({
    username: username || "",
    categoryFilter,
    sizeFilter,
    starredOnly,
  });

  // Memo operations
  const {
    editingId,
    editText,
    setEditText,
    newMemoId,
    setNewMemoId,
    expandedId,
    setExpandedId,
    startEdit,
    cancelEdit,
    saveEdit,
    softDelete,
    toggleStar,
    restoreMemo,
    hardDelete,
    handleCategoryChange,
    handleSizeChange,
    dismissReview,
  } = useMemoOperations(username || "", refetchMemos);

  // Voice recording
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

  // Search functionality
  useSearch(username || "");

  // Reload memos when processing completes (new memo saved)
  useEffect(() => {
    if (!isProcessing && !isRecording && !voiceError && voiceMemoId) {
      const timer = setTimeout(() => {
        setNewMemoId(voiceMemoId);
        refetchMemos();
        clearTranscription();
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
    setNewMemoId,
  ]);

  // Pick random memo
  const handlePickRandomMemo = useCallback(async () => {
    if (!username) return;

    const { data, error } = await supabase
      .from("memos")
      .select("*")
      .eq("username", username)
      .is("deleted_at", null);

    if (error) {
      console.error("Error fetching random memo:", error);
      return;
    }

    if (!data || data.length === 0) {
      alert("No memos available");
      return;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedMemo = data[randomIndex];

    // Transform to Memo type
    const memo: Memo = {
      ...selectedMemo,
      timestamp: new Date(selectedMemo.timestamp),
    };

    setRandomMemo(memo);
    setShowRandomMemo(true);
  }, [username, setRandomMemo, setShowRandomMemo]);

  // Handle text input submission
  const handleTextSubmit = async (text: string) => {
    if (!text.trim() || isProcessingText || !username) return;

    setIsProcessingText(true);
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      const result = await response.json();

      // Refetch memos
      refetchMemos();
      setNewMemoId(result.memo_id || crypto.randomUUID());

      // Clear and close
      setTextInput("");
      setShowTextInput(false);

      // Clear highlight after delay
      setTimeout(() => setNewMemoId(null), 3000);
    } catch (error) {
      console.error("Error processing text:", error);
    } finally {
      setIsProcessingText(false);
    }
  };

  // Toggle recording
  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: FeedbackSubmission) => {
    try {
      await FeedbackService.submitFeedback(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  };

  // Format time for recording overlay
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRecordToggle: handleRecordClick,
    onPickRandomMemo: handlePickRandomMemo,
    onCancelRecording: cancelRecording,
    isRecording,
    editingId,
    cancelEdit,
  });

  // Show username input if not set
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0e14] to-[#0f1117] flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (!username) {
    return <UsernameInput />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0e14] to-[#0f1117] text-white relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="max-w-5xl mx-auto relative z-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
                koetori
              </h1>
              <KoetoriExplanation>
                <div className="inline" />
              </KoetoriExplanation>
            </div>

            <ActionButtons
              onRecordClick={handleRecordClick}
              isRecording={isRecording}
              isProcessing={isProcessing}
              onPickRandomMemo={handlePickRandomMemo}
            />
          </div>

          {/* Voice Error Display */}
          {voiceError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{voiceError}</p>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="max-w-5xl mx-auto mb-8 relative z-40">
          <div className="flex items-center gap-4">
            {/* Star Toggle */}
            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className={`p-2 rounded-xl transition-all ${
                starredOnly
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                  : "bg-[#0d0e14]/40 border border-slate-700/20 text-slate-400 hover:bg-slate-700/30"
              }`}
              aria-label={starredOnly ? "Show all memos" : "Show starred only"}
            >
              <Star className="w-5 h-5" />
            </button>

            {/* Drawer Trigger (mobile + tablet) */}
            <button
              onClick={() => setIsFiltersDrawerOpen(true)}
              className="lg:hidden flex-1 px-4 py-3 bg-[#0a0b0f]/70 backdrop-blur-xl border border-slate-700/40 rounded-2xl text-[#cbd5e1] hover:bg-[#0a0b0f]/90 transition-all flex items-center gap-3 group"
              aria-label="Open filters"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-purple-500/20 border border-indigo-500/30">
                <Filter className="w-4 h-4 text-indigo-300" />
                {categoryFilter !== "all" && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-emerald-500/90 text-[10px] font-semibold text-white flex items-center justify-center shadow-lg">
                    1
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Filters</div>
                <div className="text-xs text-[#94a3b8] truncate">
                  {categoryFilter === "all"
                    ? "All categories"
                    : `Category: ${categoryFilter}`}
                </div>
              </div>
              <span className="text-xs text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to change
              </span>
            </button>

            {/* Desktop Filters - Categories Only */}
            <QuickFilters
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              isSpotlighted={isSpotlightMode}
              onFilterClick={() => setIsSpotlightMode(false)}
            />
          </div>

          <div className="mt-4">
            <SizeFilterShowcase
              sizeFilter={sizeFilter}
              setSizeFilter={setSizeFilter}
            />
          </div>
        </div>

        {/* Memos Content */}
        <div className="max-w-5xl mx-auto relative z-10 space-y-12">
          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Empty State */}
          {!loading && memos.length === 0 && (
            <EmptyState
              onRecordClick={handleRecordClick}
              isProcessing={isProcessing}
            />
          )}

          {/* Memos List */}
          {!loading && memos.length > 0 && (
            <MemosList
              memos={memos}
              newMemoId={newMemoId}
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
              onSizeChange={handleSizeChange}
              dismissReview={dismissReview}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
            />
          )}

          <div className="rounded-2xl border border-slate-700/30 bg-[#0b0f1a]/70 p-6 text-center">
            <h2 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-indigo-300" />
              Explore Your Enrichment Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              See all media enrichments, reminder drafts, and shopping
              suggestions together.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/20"
            >
              Open Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Recording Overlay */}
      <RecordingOverlay
        isRecording={isRecording}
        isProcessing={isProcessing}
        recordingTime={recordingTime}
        onStopRecording={stopRecording}
        formatTime={formatTime}
      />

      {/* All Modals */}
      <ModalsContainer
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
        onSizeChange={handleSizeChange}
        dismissReview={dismissReview}
        onTextSubmit={handleTextSubmit}
        onFeedbackSubmit={handleFeedbackSubmit}
        onPickRandomMemo={handlePickRandomMemo}
        username={username || ""}
        isArchivedModalOpen={isArchivedModalOpen}
        onOpenArchivedModal={() => setIsArchivedModalOpen(true)}
        onCloseArchivedModal={() => setIsArchivedModalOpen(false)}
      />

      {/* Mobile/Tablet Filters Drawer */}
      <FiltersDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sizeFilter={sizeFilter}
        setSizeFilter={setSizeFilter}
      />
    </div>
  );
}
