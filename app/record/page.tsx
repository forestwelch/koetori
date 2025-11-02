"use client";

import { useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useToast } from "../contexts/ToastContext";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function RecordPage() {
  const { username } = useUser();
  const { showSuccess, showError } = useToast();

  const {
    isRecording,
    isProcessing,
    error,
    memosCreated,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder(username || undefined);

  // Handle spacebar for recording
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle spacebar if not in an input field
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.code === "Space" && !isInputField && !isProcessing) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRecording, isProcessing, startRecording, stopRecording]);

  // Track previous processing state to detect completion and show toast
  const prevIsProcessingRef = useRef(false);

  useEffect(() => {
    // Show success toast when processing completes
    const processingJustCompleted =
      prevIsProcessingRef.current && !isProcessing;

    if (processingJustCompleted && !isRecording && !error && memosCreated > 0) {
      const message =
        memosCreated === 1 ? "1 memo created" : `${memosCreated} memos created`;
      showSuccess(message);
    }

    // Update previous processing state
    prevIsProcessingRef.current = isProcessing;
  }, [isProcessing, isRecording, error, memosCreated, showSuccess]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0f] via-[#0d0e14] to-[#0f1117]">
      <div className="flex flex-col items-center">
        {/* Record Button - Fixed position */}
        <div className="relative mb-16">
          {/* Outer pulse ring during recording */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-[#f43f5e] animate-ping opacity-20" />
          )}
          <div
            className={`absolute inset-0 rounded-full blur-xl opacity-50 transition-colors duration-300 ${
              isRecording
                ? "bg-[#f43f5e] animate-pulse"
                : "bg-[#6366f1] animate-pulse"
            }`}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            aria-label={
              isRecording
                ? "Stop recording"
                : isProcessing
                  ? "Processing audio"
                  : "Start recording (Press Space)"
            }
            aria-pressed={isRecording}
            className={`relative rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? "w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-[#f43f5e] to-[#fb7185] hover:from-[#e11d48] hover:to-[#f43f5e] shadow-[#f43f5e]/50 hover:shadow-xl hover:shadow-[#f43f5e]/70"
                : "w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] shadow-[#6366f1]/50 hover:shadow-xl hover:shadow-[#6366f1]/70"
            }`}
          >
            {isRecording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 sm:h-28 sm:w-28 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 sm:h-20 sm:w-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Text content area - Fixed height to prevent layout shift */}
        <div className="h-40 flex flex-col items-center justify-center gap-4">
          {/* Recording Timer */}
          {isRecording && (
            <div className="text-3xl sm:text-4xl font-mono text-white">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-lg text-indigo-400">Processing...</div>
          )}

          {/* Instructions */}
          {!isRecording && !isProcessing && (
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">
                Press{" "}
                <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">
                  Space
                </kbd>{" "}
                to start recording
              </p>
              <p className="text-slate-500 text-xs">
                Tap the button or press space again to stop
              </p>
            </div>
          )}

          {/* Cancel button during recording */}
          {isRecording && (
            <button
              onClick={cancelRecording}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
