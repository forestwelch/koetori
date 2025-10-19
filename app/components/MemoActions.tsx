import { Memo } from "../types/memo";
import { Star, Archive, Edit2, RotateCcw, Trash2 } from "lucide-react";

interface MemoActionsProps {
  memo: Memo;
  filter: string;
  isEditing: boolean;
  toggleStar: (id: string) => void;
  startEdit: (memo: Memo) => void;
  handleArchive: (id: string) => void;
  handleRestore: (id: string) => void;
  handleDeleteForever: (id: string) => void;
}

export function MemoActions({
  memo,
  filter,
  isEditing,
  toggleStar,
  startEdit,
  handleArchive,
  handleRestore,
  handleDeleteForever,
}: MemoActionsProps) {
  // Archive view - keep pill buttons at bottom
  if (filter === "archive") {
    return (
      <div className="flex gap-2 pt-3 border-t border-slate-700/10">
        <button
          onClick={() => handleRestore(memo.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full text-xs font-medium transition-all backdrop-blur-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore
        </button>
        <button
          onClick={() => handleDeleteForever(memo.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 rounded-full text-xs font-medium transition-all backdrop-blur-xl"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Forever
        </button>
      </div>
    );
  }

  // Active view - floating corner circular icon buttons
  return (
    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
      <button
        onClick={() => toggleStar(memo.id)}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          memo.starred
            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            : "bg-slate-700/30 text-slate-400 hover:bg-slate-600/40 backdrop-blur-xl"
        }`}
        title={memo.starred ? "Unstar" : "Star"}
      >
        <Star
          className={`w-5 h-5 ${memo.starred ? "fill-amber-400" : ""}`}
        />
      </button>
      {!isEditing && (
        <button
          onClick={() => startEdit(memo)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/30 hover:bg-slate-600/40 text-slate-400 backdrop-blur-xl transition-all"
          title="Edit"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={() => handleArchive(memo.id)}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-700/30 hover:bg-slate-600/40 text-slate-400 backdrop-blur-xl transition-all"
        title="Archive"
      >
        <Archive className="w-5 h-5" />
      </button>
    </div>
  );
}
