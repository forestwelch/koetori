"use client";

import { useEffect } from "react";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useInboxQuery } from "./hooks/useInboxQuery";
import { useMemoOperations } from "./hooks/useMemoOperations";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSearch } from "./hooks/useSearch";
import { useUser } from "./contexts/UserContext";
import { useModals } from "./contexts/ModalContext";
import { useToast } from "./contexts/ToastContext";
import { FeedbackService } from "./lib/feedback";
import { FeedbackSubmission } from "./types/feedback";

import { RecordingOverlay } from "./components/RecordingOverlay";
import { LoadingState } from "./components/LoadingState";
import { MemosList } from "./components/MemosList";
import { ModalsContainer } from "./components/ModalsContainer";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function InboxPage() {
  const { username } = useUser();
  const { showError, showSuccess } = useToast();
  const {
    setTextInput,
    setShowTextInput,
    isProcessingText,
    setIsProcessingText,
  } = useModals();

  // Inbox query - shows only unprocessed memos
  const {
    data: inboxMemos = [],
    isLoading: loading,
    refetch: refetchInbox,
  } = useInboxQuery(username);

  // Memo operations
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
  } = useMemoOperations(username || "", refetchInbox);

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

  // Search functionality
  useSearch(username || "");

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

      // Refetch inbox
      refetchInbox();
      setNewMemoId(result.memo_id || crypto.randomUUID());

      // Clear and close
      setTextInput("");
      setShowTextInput(false);

      // Show success toast with click handler to scroll to top
      showSuccess("Memo created", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Clear highlight after delay
      setTimeout(() => setNewMemoId(null), 3000);
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to process text: ${error.message}`
          : "Failed to process text. Please try again."
      );
    } finally {
      setIsProcessingText(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: FeedbackSubmission) => {
    try {
      await FeedbackService.submitFeedback(feedback);
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to submit feedback: ${error.message}`
          : "Failed to submit feedback. Please try again."
      );
      throw error;
    }
  };

  // Format time for recording overlay
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
        {!loading && inboxMemos.length > 0 && (
          <MemosList
            memos={inboxMemos}
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
        onTextSubmit={handleTextSubmit}
        onFeedbackSubmit={handleFeedbackSubmit}
        onPickRandomMemo={() => {
          // Handled in AppLayout
        }}
        username={username || ""}
        isArchivedModalOpen={false}
        onOpenArchivedModal={() => {}}
        onCloseArchivedModal={() => {}}
      />
    </>
  );
}
