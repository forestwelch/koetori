"use client";

import { useEffect, useCallback } from "react";
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
import { MobileFooter } from "./components/MobileFooter";
import { KoetoriExplanation } from "./components/KoetoriExplanation";

export default function Home() {
  const { username, isLoading: userLoading } = useUser();
  const {
    filter,
    categoryFilter,
    sizeFilter,
    setFilter,
    setCategoryFilter,
    setSizeFilter,
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
    setShowFeedback,
  } = useModals();

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
                Koetori
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
        <div
          className={`max-w-5xl mx-auto mb-8 ${
            isSpotlightMode
              ? "fixed top-24 left-0 right-0 z-50 px-3 sm:px-4 md:px-8"
              : "relative z-10"
          }`}
        >
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

        {/* Content with subtle dimming */}
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="opacity-60">
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
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            )}
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

      {/* Spotlight Overlay - below filters */}
      {isSpotlightMode && (
        <>
          {/* Dim everything except filters */}
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-all duration-300"
            onClick={() => setIsSpotlightMode(false)}
          />
        </>
      )}

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
        onTextSubmit={handleTextSubmit}
        onFeedbackSubmit={handleFeedbackSubmit}
        onPickRandomMemo={handlePickRandomMemo}
      />

      {/* Mobile Footer */}
      <MobileFooter setShowFeedback={setShowFeedback} />
    </div>
  );
}
