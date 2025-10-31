"use client";

import Link from "next/link";
import { EnrichmentDashboard } from "../components/enrichment/EnrichmentDashboard";
import { useUser } from "../contexts/UserContext";
import { LoadingState } from "../components/LoadingState";
import { UsernameInput } from "../components/UsernameInput";
import { ModalsContainer } from "../components/ModalsContainer";
import { useMemoOperations } from "../hooks/useMemoOperations";
import { useState } from "react";
import { FeedbackService } from "../lib/feedback";
import { FeedbackSubmission } from "../types/feedback";

export default function DashboardPage() {
  const { username, isLoading } = useUser();
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);

  // Minimal memo operations for viewing memos in modal
  const {
    editingId,
    editText,
    setEditText,
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
  } = useMemoOperations(username || "", async () => {});

  const handleTextSubmit = async (text: string) => {
    // No-op for dashboard
  };

  const handleFeedbackSubmit = async (feedback: FeedbackSubmission) => {
    await FeedbackService.submitFeedback(feedback);
  };

  const handlePickRandomMemo = () => {
    // No-op for dashboard
  };

  if (isLoading) {
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-8 py-8 sm:py-12 max-w-5xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-indigo-300/80">
              Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-light text-white">
              Enrichment Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Explore media cards, reminder intents, and shopping suggestions
              generated from your memos. This view updates as enrichment tasks
              run in the background or when you trigger a backfill.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700/40 bg-[#0d0e14]/50 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600/50 hover:text-white"
          >
            ← Back to Memos
          </Link>
        </header>

        <EnrichmentDashboard username={username} />
      </div>

      {/* Modals Container for MemoModal */}
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
        username={username}
        isArchivedModalOpen={isArchivedModalOpen}
        onOpenArchivedModal={() => setIsArchivedModalOpen(true)}
        onCloseArchivedModal={() => setIsArchivedModalOpen(false)}
      />
    </div>
  );
}
