interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
}: RecordButtonProps) {
  return (
    <div className="relative">
      <div
        className={`absolute inset-0 rounded-full blur-xl opacity-50 transition-colors duration-300 ${
          isRecording
            ? "bg-[#f43f5e] animate-pulse"
            : "bg-[#6366f1] animate-pulse"
        }`}
      />
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={isProcessing}
        className={`relative w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording
            ? "bg-gradient-to-br from-[#f43f5e] to-[#fb7185] hover:from-[#e11d48] hover:to-[#f43f5e] shadow-[#f43f5e]/50 hover:shadow-xl hover:shadow-[#f43f5e]/70"
            : "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] shadow-[#6366f1]/50 hover:shadow-xl hover:shadow-[#6366f1]/70"
        }`}
      >
        {isRecording ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
  );
}
