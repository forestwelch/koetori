import { Memo, Category } from "../types/memo";
import {
  getCategoryColor,
  getCategoryGradient,
  getCategoryIcon,
  formatConfidence,
} from "../lib/ui-utils";
import { CategorySelector } from "./CategorySelector";

interface MemoHeaderProps {
  memo: Memo;
  filter?: "all" | "review" | "archive" | "starred";
  onCategoryChange?: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
}

export function MemoHeader({
  memo,
  filter,
  onCategoryChange,
}: MemoHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-3">
      {/* Category Badge - Interactive Selector (not in archive) */}
      {onCategoryChange && filter !== "archive" ? (
        <CategorySelector
          currentCategory={memo.category}
          memoId={memo.id}
          onCategoryChange={onCategoryChange}
        />
      ) : (
        <div className="relative">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${getCategoryGradient(memo.category)} opacity-50 blur-sm`}
          />
          <span
            className={`relative px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-xl ${getCategoryColor(
              memo.category
            )}`}
          >
            {getCategoryIcon(memo.category)} {memo.category}
          </span>
        </div>
      )}

      {/* Confidence Bar */}
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-[#0a0a0f]/80 backdrop-blur-xl rounded-full overflow-hidden border border-slate-700/10">
          <div
            className={`h-full ${
              memo.confidence >= 0.7
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : memo.confidence >= 0.5
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
            }`}
            style={{ width: `${memo.confidence * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#94a3b8] select-text">
          {formatConfidence(memo.confidence)}
        </span>
      </div>

      {/* Review Flag */}
      {memo.needs_review && (
        <span className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/40 rounded-full text-xs font-medium backdrop-blur-xl">
          ⚠️ Review
        </span>
      )}

      {/* Date */}
      <span className="ml-auto text-xs text-[#64748b] select-text">
        {new Date(memo.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
