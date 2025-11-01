"use client";

import { ReactNode, useCallback } from "react";
import { useUser } from "../../contexts/UserContext";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { useModals } from "../../contexts/ModalContext";
import { useToast } from "../../contexts/ToastContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { supabase } from "../../lib/supabase";
import { Memo } from "../../types/memo";
import { ActionButtons } from "../ActionButtons";
import { KoetoriExplanation } from "../KoetoriExplanation";
import { UsernameInput } from "../UsernameInput";
import { LoadingState } from "../LoadingState";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { username, isLoading: userLoading } = useUser();
  const pathname = usePathname();
  const { setRandomMemo, setShowRandomMemo } = useModals();
  const { showError, showWarning } = useToast();

  // Voice recording (needed for record button)
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder(username || undefined);

  // Handle record click
  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  // Pick random memo
  const handlePickRandomMemo = useCallback(async () => {
    if (!username) return;

    const { data, error } = await supabase
      .from("memos")
      .select("*")
      .eq("username", username)
      .is("deleted_at", null);

    if (error) {
      showError(
        `Failed to fetch random memo: ${error.message || "Unknown error"}`
      );
      return;
    }

    if (!data || data.length === 0) {
      showWarning("No memos available");
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
  }, [username, setRandomMemo, setShowRandomMemo, showError, showWarning]);

  // Keyboard shortcuts - set up globally
  useKeyboardShortcuts({
    onRecordToggle: handleRecordClick,
    onPickRandomMemo: handlePickRandomMemo,
    onCancelRecording: cancelRecording,
    isRecording,
    editingId: null, // Editing handled in individual pages
    cancelEdit: () => {}, // Editing handled in individual pages
  });

  // Show loading or username input if needed
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0e14] to-[#0f1117] text-white relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-fuchsia-500/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.03),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen h-screen">
        {/* Sidebar */}
        <Sidebar currentPath={pathname} />

        {/* Main Content Area - width adjusts with sidebar but no shift */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl w-full overflow-hidden">
            <div className="w-full px-3 sm:px-4 md:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo removed on desktop - only in sidebar now */}
                <div className="hidden lg:block" />

                {/* Action Buttons */}
                <ActionButtons
                  onRecordClick={handleRecordClick}
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  onPickRandomMemo={handlePickRandomMemo}
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
            <div className="w-full px-3 sm:px-4 md:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
