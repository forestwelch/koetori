interface TranscriptionDisplayProps {
  text: string;
}

export function TranscriptionDisplay({ text }: TranscriptionDisplayProps) {
  return (
    <div className="w-full p-6 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30">
      <h3 className="text-[#e2e8f0] text-sm font-light mb-3">Transcription</h3>
      <p className="text-[#94a3b8] text-sm font-light leading-relaxed">{text}</p>
    </div>
  );
}
