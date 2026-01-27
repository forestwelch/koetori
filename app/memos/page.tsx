"use client";

import { useEffect, useState } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useMemosQuery } from "../hooks/useMemosQuery";
import { useMemoOperations } from "../hooks/useMemoOperations";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useUser } from "../contexts/UserContext";
import { useFilters } from "../contexts/FilterContext";
import { useModals } from "../contexts/ModalContext";
import { useToast } from "../contexts/ToastContext";

import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { MemosList } from "../components/MemosList";
import { QuickFilters } from "../components/QuickFilters";
import { FiltersDrawer } from "../components/FiltersDrawer";
import { useEditing } from "../contexts/EditingContext";
import { Filter, Star, Archive } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function MemosPage() {
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  const { username } = useUser();
  const { setHandlers } = useEditing();
  const {
    categoryFilter,
    starredOnly,
    setCategoryFilter,
    setStarredOnly,
    isSpotlightMode,
    setIsSpotlightMode,
  } = useFilters();

  const { showSuccess } = useToast();
  const {
    setTextInput,
    setShowTextInput,
    isProcessingText,
    setIsProcessingText,
  } = useModals();

  // React Query for all memos (with filters)
  const {
    data: memos = [],
    isLoading: loading,
    refetch: refetchMemos,
  } = useMemosQuery({
    username: username || "",
    categoryFilter,
    starredOnly,
  });

  // Memo operations
  const memoOperations = useMemoOperations(username || "", refetchMemos);
  const {
    editingId,
    editText,
    setEditText,
    editingSummaryId,
    summaryEditText,
    setSummaryEditText,
    startEditSummary,
    cancelEditSummary,
    saveSummary,
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
    dismissReview,
  } = memoOperations;

  // Register editing handlers with global EditingContext
  // Handlers are stored in a ref, so we can update them on every render without causing re-renders
  useEffect(() => {
    // Update handlers ref on every render to ensure fresh function references
    setHandlers({
      editingId,
      editText,
      setEditText,
      startEdit,
      cancelEdit,
      saveEdit,
      editingSummaryId,
      summaryEditText,
      setSummaryEditText,
      startEditSummary,
      cancelEditSummary,
      saveSummary,
      softDelete,
      toggleStar,
      restoreMemo,
      hardDelete,
      onCategoryChange: handleCategoryChange,
      dismissReview,
    });
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => setHandlers(null);
  }, [setHandlers]);

  // Voice recording
  const {
    isRecording,
    isProcessing,
    error: voiceError,
    memoId: voiceMemoId,
    recordingTime,
    stopRecording,
    cancelRecording,
    clearTranscription,
  } = useVoiceRecorder(username || undefined);

  // Hash navigation - handle memo links like /#memo-123
  const { setShowMemoModal, setMemoModalId } = useModals();
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#memo-")) {
        const memoId = hash.replace("#memo-", "");
        if (memoId) {
          setMemoModalId(memoId);
          setShowMemoModal(true);
        }
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setShowMemoModal, setMemoModalId]);

  // Reload memos when processing completes (new memo saved)
  useEffect(() => {
    if (!isProcessing && !isRecording && !voiceError && voiceMemoId) {
      const timer = setTimeout(() => {
        setNewMemoId(voiceMemoId);
        refetchMemos();
        clearTranscription();

        // Show success toast with click handler to scroll to top
        showSuccess("Memo recorded", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

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
    showSuccess,
  ]);

  // Text input and feedback submission are handled in AppLayout

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRecordToggle: () => {
      // Recording handled in AppLayout
    },
    onPickRandomMemo: () => {
      // Handled in AppLayout
    },
    onCancelRecording: cancelRecording,
    isRecording,
    editingId,
    cancelEdit,
  });

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-2">
            All Memos
          </h2>
          <p className="text-slate-400 text-sm">
            Browse and filter all your memos
          </p>
        </div>
      </div>

      {/* Voice Error Display */}
      {voiceError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{voiceError}</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-8">
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
      </div>

      {/* Memos Content */}
      <div className="space-y-8">
        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Empty State */}
        {!loading && memos.length === 0 && (
          <EmptyState
            onRecordClick={() => {
              // Recording handled in AppLayout
            }}
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
            editingSummaryId={editingSummaryId}
            summaryEditText={summaryEditText}
            setSummaryEditText={setSummaryEditText}
            startEditSummary={startEditSummary}
            cancelEditSummary={cancelEditSummary}
            saveSummary={saveSummary}
            softDelete={softDelete}
            toggleStar={toggleStar}
            restoreMemo={restoreMemo}
            hardDelete={hardDelete}
            onCategoryChange={handleCategoryChange}
            dismissReview={dismissReview}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        )}
      </div>

      {/* Mobile/Tablet Filters Drawer */}
      <FiltersDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />
    </>
  );
}
