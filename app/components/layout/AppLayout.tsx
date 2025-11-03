"use client";

import { ReactNode, useCallback, useState } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { ActionButton } from "../ActionButton";
import { RecordingOverlay } from "../RecordingOverlay";
import { ModalsContainer } from "../ModalsContainer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { username, isLoading: userLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const {
    setRandomMemo,
    setShowRandomMemo,
    textInput,
    setTextInput,
    setShowTextInput,
    isProcessingText,
    setIsProcessingText,
  } = useModals();
  const { showError, showWarning, showSuccess } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Voice recording (needed for record button)
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingTime,
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

  // Format time for recording overlay
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle text input submission globally
  const handleTextSubmit = useCallback(
    async (text: string) => {
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

        // Clear and close
        setTextInput("");
        setShowTextInput(false);

        // Show success toast
        showSuccess("Memo created successfully!");

        // Navigate to inbox to see the new memo
        if (pathname !== "/") {
          router.push("/");
        } else {
          // If already on inbox, refresh the page
          router.refresh();
        }
      } catch (error) {
        showError(
          error instanceof Error
            ? `Failed to process text: ${error.message}`
            : "Failed to process text. Please try again."
        );
      } finally {
        setIsProcessingText(false);
      }
    },
    [
      username,
      isProcessingText,
      setIsProcessingText,
      setTextInput,
      setShowTextInput,
      showSuccess,
      showError,
      pathname,
      router,
    ]
  );

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
        <Sidebar
          currentPath={pathname}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Main Content Area - width adjusts with sidebar but no shift */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl w-full overflow-hidden">
            <div className="w-full px-3 sm:px-4 md:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo removed on desktop - only in sidebar now */}
                <div className="hidden lg:block" />

                {/* Action Buttons Container */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Action Buttons */}
                  <ActionButtons
                    onRecordClick={handleRecordClick}
                    isRecording={isRecording}
                    isProcessing={isProcessing}
                    onPickRandomMemo={handlePickRandomMemo}
                  />

                  {/* Mobile Hamburger Menu - Right side */}
                  <ActionButton
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    icon={Menu}
                    label="Menu"
                    variant="secondary"
                    iconOnly
                    className="lg:hidden"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none scrollbar-gutter-stable">
            <div className="w-full max-w-full px-3 sm:px-4 md:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Recording Overlay - Global */}
      <RecordingOverlay
        isRecording={isRecording}
        isProcessing={isProcessing}
        recordingTime={recordingTime}
        onStopRecording={stopRecording}
        formatTime={formatTime}
      />

      {/* Global Modals Container - for text input and other global modals */}
      <ModalsContainer
        editingId={null}
        editText=""
        setEditText={() => {}}
        startEdit={() => {}}
        cancelEdit={() => {}}
        saveEdit={() => {}}
        editingSummaryId={null}
        summaryEditText=""
        setSummaryEditText={() => {}}
        startEditSummary={() => {}}
        cancelEditSummary={() => {}}
        saveSummary={() => {}}
        softDelete={() => {}}
        toggleStar={() => {}}
        restoreMemo={async () => {}}
        hardDelete={async () => {}}
        onCategoryChange={() => {}}
        dismissReview={() => {}}
        onTextSubmit={handleTextSubmit}
        onFeedbackSubmit={async () => {}}
        onPickRandomMemo={handlePickRandomMemo}
        username={username || ""}
        isArchivedModalOpen={false}
        onOpenArchivedModal={() => {}}
        onCloseArchivedModal={() => {}}
      />
    </div>
  );
}
