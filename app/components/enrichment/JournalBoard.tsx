"use client";

import { JournalItem } from "../../types/enrichment";
import { LoadingSpinner } from "../LoadingSpinner";
import { BookOpen, Calendar, Tag, Heart, ExternalLink } from "lucide-react";
import { useModals } from "../../contexts/ModalContext";
import { Card } from "../ui/Card";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface JournalBoardProps {
  items: JournalItem[];
  isLoading: boolean;
  error?: Error | null;
}

export function JournalBoard({ items, isLoading, error }: JournalBoardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <LoadingSpinner size="md" message="Loading journal entries..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-400">
        Failed to load journal entries: {error.message}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-8 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">
          No journal entries yet. Record your thoughts and they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Journal</h2>
          <p className="text-sm text-slate-400">
            Your personal thoughts and reflections
          </p>
        </div>
        <div className="text-sm text-slate-400">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <JournalCard key={item.memoId} item={item} />
        ))}
      </div>
    </div>
  );
}

function JournalCard({ item }: { item: JournalItem }) {
  const { setShowMemoModal, setMemoModalId } = useModals();

  const handleViewMemo = () => {
    setMemoModalId(item.memoId);
    setShowMemoModal(true);
  };

  return (
    <Card
      variant="default"
      padding="lg"
      interactive
      className="group border-amber-500/20 hover:border-amber-500/40 transition-all"
      data-memo-id={item.memoId}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.createdAt)}</span>
          </div>
          {item.mood && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20">
              <Heart className="h-3 w-3" />
              <span className="capitalize">{item.mood}</span>
            </div>
          )}
        </div>

        <p className="text-slate-200 text-sm leading-relaxed group-hover:text-white transition-colors">
          {item.entryText}
        </p>

        {(item.themes && item.themes.length > 0) || item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {item.themes?.map((theme, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20"
              >
                {theme}
              </span>
            ))}
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-end pt-2 border-t border-slate-700/30">
          <button
            onClick={handleViewMemo}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            View Full Memo
          </button>
        </div>
      </div>
    </Card>
  );
}
