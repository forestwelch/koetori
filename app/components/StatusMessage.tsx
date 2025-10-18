interface StatusMessageProps {
  isRecording: boolean;
  isProcessing: boolean;
}

export function StatusMessage({
  isRecording,
  isProcessing,
}: StatusMessageProps) {
  const getStatus = () => {
    if (isProcessing)
      return {
        title: "Processing...",
        subtitle: "Please wait while we process your recording",
      };
    if (isRecording)
      return {
        title: "Recording...",
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
