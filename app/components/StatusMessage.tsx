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

  const getStatus = () => {
    if (isProcessing)
      return {
        title: "Processing...",
        subtitle: "Please wait while we transcribe your recording",
      };
    if (isRecording)
      return {
        title: `Recording... ${formatTime(recordingTime)}`,
        subtitle: "Click the button to stop recording",
      };
    return {
      title: "Ready to Record",
      subtitle: "Click the microphone to start capturing audio",
    };
  };

  const status = getStatus();

  return (
    <div className="space-y-2">
      <p className="text-[#e2e8f0] text-lg font-light">{status.title}</p>
      <p className="text-[#64748b] text-sm font-light">{status.subtitle}</p>
    </div>
  );
}
