"use client";

import { useEffect, useState, useMemo } from "react";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useInboxQuery } from "./hooks/useInboxQuery";
import { useMemoOperations } from "./hooks/useMemoOperations";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useBulkMemoOperations } from "./hooks/useBulkMemoOperations";
import { useUser } from "./contexts/UserContext";
import { useModals } from "./contexts/ModalContext";
import { useToast } from "./contexts/ToastContext";
import { Memo } from "./types/memo";

import { LoadingState } from "./components/LoadingState";
import { MemosList } from "./components/MemosList";
import {
  PowerInboxSections,
  InboxSection,
  filterMemosBySection,
} from "./components/inbox/PowerInboxSections";
import {
  InboxSortControls,
  SortField,
  SortDirection,
} from "./components/inbox/InboxSortControls";
import { QuickActions } from "./components/inbox/QuickActions";
import { useEditing } from "./contexts/EditingContext";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function InboxPage() {
  const { username } = useUser();
  const { showSuccess } = useToast();
  const {
    setTextInput,
    setShowTextInput,
    isProcessingText,
    setIsProcessingText,
  } = useModals();
  const { setHandlers } = useEditing();

  // Power Inbox state
  const [activeSection, setActiveSection] = useState<InboxSection>("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedMemos, setSelectedMemos] = useState<string[]>([]);

  // Inbox query - shows only unprocessed memos
  const {
    data: inboxMemos = [],
    isLoading: loading,
    refetch: refetchInbox,
  } = useInboxQuery(username);

  // Bulk operations
  const { bulkArchive, bulkCategorize, bulkMarkReviewed } =
    useBulkMemoOperations(username || "");

  // Filter and sort memos
  const filteredAndSortedMemos = useMemo(() => {
    // First filter by section
    let filtered = filterMemosBySection(inboxMemos, activeSection);

    // Then sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "timestamp":
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case "confidence":
          comparison = a.confidence - b.confidence;
          break;
        case "starred":
          // Starred first (true = 1, false = 0)
          comparison = (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
          // Then by timestamp
          if (comparison === 0) {
            comparison = b.timestamp.getTime() - a.timestamp.getTime();
          }
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [inboxMemos, activeSection, sortField, sortDirection]);

  // Memo operations
  const memoOperations = useMemoOperations(username || "", refetchInbox);
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

  // Reload inbox when processing completes (new memo saved)
  useEffect(() => {
    if (!isProcessing && !isRecording && !voiceError && voiceMemoId) {
      const timer = setTimeout(() => {
        setNewMemoId(voiceMemoId);
        refetchInbox();
        clearTranscription();

        // Show success toast with click handler to scroll to top
        showSuccess("Memo recorded", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

        setTimeout(() => setNewMemoId(null), 2000);
      }, 300); // Reduced delay for faster appearance
      return () => clearTimeout(timer);
    }
  }, [
    isProcessing,
    isRecording,
    voiceError,
    voiceMemoId,
    refetchInbox,
    clearTranscription,
    setNewMemoId,
    showSuccess,
  ]);

  // Text input and feedback submission are handled in AppLayout

  // Keyboard shortcuts for editing (record/pick random handled in AppLayout)
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
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-light text-white mb-2">
          Inbox
        </h2>
        <p className="text-slate-400 text-sm">
          Memos that need your attention or processing
        </p>
      </div>

      {/* Voice Error Display */}
      {voiceError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{voiceError}</p>
        </div>
      )}

      {/* Power Inbox Controls */}
      {!loading && inboxMemos.length > 0 && (
        <div className="space-y-4 mb-6">
          {/* Sections */}
          <PowerInboxSections
            memos={inboxMemos}
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setSelectedMemos([]); // Clear selection when changing section
            }}
          />

          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <InboxSortControls
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={(field, direction) => {
                setSortField(field);
                setSortDirection(direction);
              }}
            />
          </div>

          {/* Quick Actions Bar */}
          <QuickActions
            selectedMemos={selectedMemos}
            memos={filteredAndSortedMemos}
            onBulkArchive={async (ids) => {
              const success = await bulkArchive(ids);
              if (success) setSelectedMemos([]);
            }}
            onBulkCategorize={async (ids, category) => {
              const success = await bulkCategorize(ids, category);
              if (success) setSelectedMemos([]);
            }}
            onBulkMarkReviewed={async (ids) => {
              const success = await bulkMarkReviewed(ids);
              if (success) setSelectedMemos([]);
            }}
            onClearSelection={() => setSelectedMemos([])}
          />
        </div>
      )}

      {/* Inbox Content */}
      <div className="space-y-8">
        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Empty State */}
        {!loading && inboxMemos.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
              <LayoutDashboard className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Inbox is empty!
            </h3>
            <p className="text-slate-400 mb-6">
              All your memos have been processed. Great work!
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/20"
            >
              View Dashboard →
            </Link>
          </div>
        )}

        {/* Inbox Memos List */}
        {!loading && filteredAndSortedMemos.length > 0 && (
          <MemosList
            memos={filteredAndSortedMemos}
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
            selectedMemos={selectedMemos}
            onToggleSelect={(memoId) => {
              setSelectedMemos((prev) =>
                prev.includes(memoId)
                  ? prev.filter((id) => id !== memoId)
                  : [...prev, memoId]
              );
            }}
          />
        )}

        {/* Empty Filter State */}
        {!loading &&
          inboxMemos.length > 0 &&
          filteredAndSortedMemos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">
                No memos match the current filters. Try a different section.
              </p>
            </div>
          )}
      </div>
    </>
  );
}
