"use client";

import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { RecordButton } from "./components/RecordButton";
import { StatusMessage } from "./components/StatusMessage";
import { ErrorAlert } from "./components/ErrorAlert";
import { TranscriptionDisplay } from "./components/TranscriptionDisplay";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { useEffect } from "react";

export default function Home() {
  const {
    isRecording,
    isProcessing,
    error,
    transcription,
    recordingTime,
    audioStream,
    startRecording,
    stopRecording,
    clearTranscription,
  } = useVoiceRecorder();

  // Keyboard shortcut: Space bar to toggle recording
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea and transcription isn't showing
      if (e.code === "Space" && !transcription && e.target === document.body) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isProcessing) {
          startRecording();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isRecording, isProcessing, transcription, startRecording, stopRecording]);

  return (
    <div
      className="min-h-screen p-4 sm:p-8 relative overflow-hidden"
      role="main"
      aria-label="Voice recording and transcription application"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-light mb-2 sm:mb-3 bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
            Koetori
          </h1>
          <p className="text-[#94a3b8] text-xs sm:text-sm font-light">
            Voice Capture & Transcription
          </p>
        </div>

        {/* Main card with glass morphism */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div
            className={`absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur transition duration-500 ${
              isRecording
                ? "from-[#f43f5e] to-[#fb7185] opacity-40 animate-pulse"
                : "from-[#6366f1] to-[#f43f5e] opacity-20 group-hover:opacity-30"
            }`}
          />

          {/* Glass card */}
          <div className="relative bg-[#14151f]/80 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-8 sm:p-12">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
              <RecordButton
                isRecording={isRecording}
                isProcessing={isProcessing}
                onStart={startRecording}
                onStop={stopRecording}
              />

              {/* Audio Visualizer */}
              <AudioVisualizer isRecording={isRecording} stream={audioStream} />

              <StatusMessage
                isRecording={isRecording}
                isProcessing={isProcessing}
                recordingTime={recordingTime}
              />

              {error && <ErrorAlert message={error} />}

              {/* Keyboard shortcut hint */}
              {!transcription && !isRecording && !isProcessing && (
                <p className="text-[#64748b] text-xs font-light mt-2">
                  Press{" "}
                  <kbd className="px-2 py-0.5 bg-[#1e1f2a] border border-slate-700/50 rounded text-[#94a3b8]">
                    Space
                  </kbd>{" "}
                  to start
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Transcription display below the card */}
        {transcription && (
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            <TranscriptionDisplay text={transcription} />
            <button
              onClick={clearTranscription}
              aria-label="Clear transcription and record again"
              className="w-full py-2.5 sm:py-3 px-4 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30 text-[#94a3b8] text-xs sm:text-sm font-light hover:border-slate-600/50 hover:text-[#cbd5e1] transition-all active:scale-98"
            >
              Clear & Record Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
