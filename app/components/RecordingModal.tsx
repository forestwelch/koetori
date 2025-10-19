"use client";

import { RecordButton } from "./RecordButton";
import { AudioVisualizer } from "./AudioVisualizer";
import { TranscriptionDisplay } from "./TranscriptionDisplay";
import { StatusMessage } from "./StatusMessage";
import { ErrorAlert } from "./ErrorAlert";
import { MemoDisplay } from "./MemoDisplay";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordingModal({
  isOpen,
  onClose,
}: RecordingModalProps) {
  const {
    isRecording,
    isProcessing,
    transcription,
    error,
    startRecording,
    stopRecording,
    clearTranscription,
    category,
    confidence,
    needsReview,
    extracted,
    tags,
    recordingTime,
    audioStream,
  } = useVoiceRecorder();

  const handleClose = () => {
    clearTranscription();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-all duration-500 ${
          isRecording ? "scale-100" : "scale-95"
        }`}
      >
        <div
          className={`w-full max-w-4xl bg-[#0a0a0f] rounded-2xl border border-slate-700/30 shadow-2xl pointer-events-auto transform transition-all duration-500 ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
            <h2 className="text-2xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
              Record Memo
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-[#94a3b8] hover:text-[#cbd5e1] transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Error Display */}
              {error && <ErrorAlert message={error} />}

              {/* Status Message */}
              <StatusMessage
                isRecording={isRecording}
                isProcessing={isProcessing}
                recordingTime={recordingTime}
              />

              {/* Record Button */}
              <div className="flex justify-center">
                <RecordButton
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  onStart={startRecording}
                  onStop={stopRecording}
                />
              </div>

              {/* Audio Visualizer */}
              {isRecording && (
                <AudioVisualizer
                  isRecording={isRecording}
                  stream={audioStream}
                />
              )}

              {/* Transcription Display */}
              {transcription && <TranscriptionDisplay text={transcription} />}

              {/* Memo Display */}
              {transcription &&
                category &&
                confidence !== null &&
                extracted && (
                  <MemoDisplay
                    transcript={transcription}
                    category={category}
                    confidence={confidence}
                    needsReview={needsReview}
                    extracted={extracted}
                    tags={tags}
                  />
                )}

              {/* Success Actions */}
              {transcription && !isProcessing && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={clearTranscription}
                    className="px-6 py-3 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30 text-[#94a3b8] font-light hover:border-slate-600/50 hover:text-[#cbd5e1] transition-all"
                  >
                    Record Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
