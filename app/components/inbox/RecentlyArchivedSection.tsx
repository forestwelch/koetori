"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { Memo } from "../../types/memo";
import { CategoryBadge } from "../CategoryBadge";
import { Button } from "../ui/Button";
import { useMemoEnrichments } from "../../hooks/useMemoEnrichments";

interface RecentlyArchivedSectionProps {
  archivedMemos: Memo[];
  onDismiss: (memoId: string) => void;
  onRestore: (memoId: string) => void;
}

function ArchivedMemoRow({
  memo,
  onDismiss,
  onRestore,
}: {
  memo: Memo;
  onDismiss: (memoId: string) => void;
  onRestore: (memoId: string) => void;
}) {
  const { data: enrichments, isLoading } = useMemoEnrichments(memo.id);
  const summary = memo.extracted?.what || memo.transcript.slice(0, 80);

  const hasEnrichments = enrichments
    ? Object.values(enrichments).some((v) => v)
    : false;

  return (
    <div className="group relative p-3 bg-[#0d0e14]/40 rounded-lg border border-slate-700/20 hover:border-slate-600/30 transition-all">
      <div className="flex items-start gap-3">
        <CategoryBadge category={memo.category} />

        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300 mb-1 line-clamp-1">{summary}</p>

          <div className="flex items-center gap-2 text-xs">
            {/* Enrichment Status */}
            {isLoading ? (
              <span className="text-slate-500">Checking enrichments...</span>
            ) : hasEnrichments ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Enriched
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500">
                <XCircle className="w-3 h-3" />
                No enrichments
              </span>
            )}

            <span className="text-slate-700">•</span>

            {/* Time archived */}
            <span className="text-slate-500">
              {memo.deleted_at
                ? `${Math.round((Date.now() - memo.deleted_at.getTime()) / (1000 * 60))}m ago`
                : "Recently"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onDismiss(memo.id)}
            variant="unstyled"
            size="custom"
            className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700/30 rounded transition-colors"
          >
            Dismiss
          </Button>
          <Button
            onClick={() => onRestore(memo.id)}
            variant="unstyled"
            size="custom"
            className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
          >
            Restore
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecentlyArchivedSection({
  archivedMemos,
  onDismiss,
  onRestore,
}: RecentlyArchivedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (archivedMemos.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-[#0a0b0f]/60 backdrop-blur-xl border border-slate-700/30 rounded-xl">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 text-left group"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <h3 className="text-sm font-medium text-slate-300">
            Recently Archived
          </h3>
          <span className="px-2 py-0.5 bg-slate-700/40 text-slate-400 text-xs rounded-full">
            {archivedMemos.length}
          </span>
        </div>
        <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {isExpanded ? "Collapse" : "Expand"}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-3">
            Memos archived in the last 24 hours. Verify enrichments or restore
            if needed.
          </p>
          {archivedMemos.map((memo) => (
            <ArchivedMemoRow
              key={memo.id}
              memo={memo}
              onDismiss={onDismiss}
              onRestore={onRestore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
