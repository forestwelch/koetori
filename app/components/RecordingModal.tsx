"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      showCloseButton={true}
      title="Record Memo"
    >
      {/* Content */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
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
            <AudioVisualizer isRecording={isRecording} stream={audioStream} />
          )}

          {/* Transcription Display */}
          {transcription && <TranscriptionDisplay text={transcription} />}

          {/* Memo Display */}
          {transcription && category && confidence !== null && extracted && (
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
              <Button
                onClick={clearTranscription}
                variant="outline"
                size="lg"
                className="backdrop-blur-xl"
              >
                Record Another
              </Button>
              <Button onClick={handleClose} variant="primary" size="lg">
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
