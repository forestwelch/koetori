import { AlertCircle } from "lucide-react";
import { Memo, Category } from "../types/memo";
import { formatConfidence } from "../lib/ui-utils";
import { CategorySelector } from "./CategorySelector";
import { CategoryBadge } from "./CategoryBadge";

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
        <CategoryBadge category={memo.category} mode="expanded" />
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
        <span
          className="inline-flex h-6 w-6 items-center justify-center text-purple-400"
          title="Needs review"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Needs review</span>
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
