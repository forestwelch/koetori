import { Memo } from "../types/memo";

interface MemoContentProps {
  memo: Memo;
  isEditing: boolean;
  editText: string;
  setEditText: (text: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
}

export function MemoContent({
  memo,
  isEditing,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
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
          <button
            onClick={() => saveEdit(memo.id)}
            className="px-3 py-1.5 bg-indigo-500/90 hover:bg-indigo-600 text-white rounded-full text-xs font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            ✓ Save
          </button>
          <button
            onClick={cancelEdit}
            className="px-3 py-1.5 bg-[#14151f]/60 hover:bg-[#14151f]/80 text-[#94a3b8] border border-slate-700/30 rounded-full text-xs font-medium transition-all"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <p className="text-[#cbd5e1] text-sm sm:text-base font-light leading-relaxed select-text">
        {memo.transcript}
      </p>

      {/* Extracted Data */}
      {memo.extracted &&
        (memo.extracted.title ||
          memo.extracted.who ||
          memo.extracted.when ||
          memo.extracted.where ||
          memo.extracted.what) && (
          <div className="mt-3 p-3 bg-[#0a0a0f]/60 backdrop-blur-xl rounded-xl border border-slate-700/10 space-y-1.5 text-sm select-text">
            {memo.extracted.title && (
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
            {memo.extracted.actionable && (
              <div className="pt-1">
                <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/40 rounded-full backdrop-blur-xl">
                  🎯 Actionable
                </span>
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
