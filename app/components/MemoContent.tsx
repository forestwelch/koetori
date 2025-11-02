import { Memo } from "../types/memo";
import { Button } from "./ui/Button";

interface MemoContentProps {
  memo: Memo;
  isEditing: boolean;
  editText: string;
  setEditText: (text: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  onViewFullRecording?: () => void;
}

export function MemoContent({
  memo,
  isEditing,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
  onViewFullRecording,
}: MemoContentProps) {
  if (isEditing) {
    return (
      <div className="mb-3">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full p-3 bg-[#0a0a0f]/60 backdrop-blur-xl border border-indigo-500/50 rounded-xl text-[#cbd5e1] text-sm sm:text-base font-light leading-relaxed focus:outline-none focus:border-indigo-500 resize-none select-text"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => saveEdit(memo.id)}
            variant="unstyled"
            size="custom"
            className="px-3 py-1.5 bg-indigo-500/90 hover:bg-indigo-600 text-white rounded-full text-xs font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            ✓ Save
          </Button>
          <Button
            onClick={cancelEdit}
            variant="unstyled"
            size="custom"
            className="px-3 py-1.5 bg-[#14151f]/60 hover:bg-[#14151f]/80 text-[#94a3b8] border border-slate-700/30 rounded-full text-xs font-medium transition-all"
          >
            ✕ Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Determine what transcript text to show
  const shouldShowExcerpt = memo.transcription_id && memo.transcript_excerpt;
  const transcriptToShow = shouldShowExcerpt
    ? memo.transcript_excerpt
    : memo.transcript;

  return (
    <div className="mb-3">
      <p
        className={`text-[#cbd5e1] text-sm sm:text-base font-light leading-relaxed select-text ${
          shouldShowExcerpt ? "line-clamp-2" : ""
        }`}
      >
        {transcriptToShow}
      </p>

      {/* View Full Recording Button */}
      {shouldShowExcerpt && onViewFullRecording && (
        <button
          onClick={onViewFullRecording}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View full
        </button>
      )}

      {/* Extracted Data */}
      {memo.extracted &&
        (memo.extracted.title ||
          memo.extracted.who ||
          memo.extracted.when ||
          memo.extracted.where ||
          memo.extracted.what) && (
          <div className="mt-3 p-3 bg-[#0a0a0f]/60 backdrop-blur-xl rounded-xl border border-slate-700/10 space-y-1.5 text-sm select-text">
            {memo.extracted.title && memo.category === "media" && (
              <div>
                <span className="text-[#64748b] font-medium">Title: </span>
                <span className="text-[#e2e8f0]">{memo.extracted.title}</span>
              </div>
            )}
            {memo.extracted.who && memo.extracted.who.length > 0 && (
              <div>
                <span className="text-[#64748b] font-medium">People: </span>
                <span className="text-[#cbd5e1]">
                  {memo.extracted.who.join(", ")}
                </span>
              </div>
            )}
            {memo.extracted.when && (
              <div>
                <span className="text-[#64748b] font-medium">When: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.when}</span>
              </div>
            )}
            {memo.extracted.where && (
              <div>
                <span className="text-[#64748b] font-medium">Where: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.where}</span>
              </div>
            )}
            {memo.extracted.what && (
              <div>
                <span className="text-[#64748b] font-medium">Summary: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.what}</span>
              </div>
            )}
          </div>
        )}

      {/* Tags */}
      {memo.tags && memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {memo.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#0a0a0f]/60 text-[#94a3b8] border border-slate-700/20 rounded-full text-xs backdrop-blur-xl select-text"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
