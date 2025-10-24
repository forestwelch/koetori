"use client";

import { Button } from "./ui/Button";

interface RecordingOverlayProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  onStopRecording: () => void;
  formatTime: (seconds: number) => string;
}

export function RecordingOverlay({
  isRecording,
  isProcessing,
  recordingTime,
  onStopRecording,
  formatTime,
}: RecordingOverlayProps) {
  if (!isRecording && !isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
      <div className="text-center w-full max-w-md mx-auto px-4">
        {isRecording ? (
          <>
            {/* Recording Animation */}
            <div className="relative mb-8 flex items-center justify-center">
              <div className="w-32 h-32 bg-red-500/20 rounded-full absolute animate-ping" />
              <Button
                onClick={onStopRecording}
                variant="unstyled"
                size="custom"
                className="relative w-32 h-32 bg-red-500 rounded-full shadow-2xl shadow-red-500/50 hover:bg-red-600 transition-all flex items-center justify-center"
                aria-label="Stop recording"
              >
                <div className="w-12 h-12 bg-white rounded-sm" />
              </Button>
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
                <span className="hidden sm:inline">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-[#1e1f2a] rounded text-[10px] font-mono">
                    Space
                  </kbd>{" "}
                  to stop or{" "}
                  <kbd className="px-1.5 py-0.5 bg-[#1e1f2a] rounded text-[10px] font-mono">
                    Esc
                  </kbd>{" "}
                  to cancel
                </span>
                <span className="sm:hidden">Tap to stop recording</span>
              </p>
            </div>
          </>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center"
          >
            {/* Processing Animation */}
            <div
              className="w-32 h-32 border-8 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"
              aria-hidden="true"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="text-indigo-400 text-2xl font-medium">
                Processing...
              </div>
              <p className="text-[#94a3b8] text-sm">
                Transcribing and categorizing your memo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
