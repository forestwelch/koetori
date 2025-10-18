interface StatusMessageProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime?: number;
}

export function StatusMessage({
  isRecording,
  isProcessing,
  recordingTime = 0,
}: StatusMessageProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="text-center text-sm sm:text-base text-[#94a3b8] font-light"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isRecording ? (
        <span>
          Recording...{" "}
          <span className="text-indigo-400">{formatTime(recordingTime)}</span>
        </span>
      ) : isProcessing ? (
        "Processing audio..."
      ) : (
        "Click to start recording"
      )}
    </div>
  );
}
