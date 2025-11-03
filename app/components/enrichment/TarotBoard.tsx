"use client";

import { TarotItem } from "../../types/enrichment";
import { LoadingSpinner } from "../LoadingSpinner";
import { Sparkles, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface TarotBoardProps {
  items: TarotItem[];
  isLoading: boolean;
  error?: Error | null;
}

export function TarotBoard({ items, isLoading, error }: TarotBoardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <LoadingSpinner size="md" message="Loading tarot readings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-400">
        Failed to load tarot readings: {error.message}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-8 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">
          No tarot readings yet. Record your card draws and they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Tarot</h2>
          <p className="text-sm text-slate-400">
            Your tarot card readings and interpretations
          </p>
        </div>
        <div className="text-sm text-slate-400">
          {items.length} {items.length === 1 ? "reading" : "readings"}
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <TarotCard key={item.memoId} item={item} />
        ))}
      </div>
    </div>
  );
}

function TarotCard({ item }: { item: TarotItem }) {
  const isMajorArcana = item.cardType === "major_arcana";
  const isMinorArcana = item.cardType === "minor_arcana";

  return (
    <Link
      href={`/#memo-${item.memoId}`}
      data-memo-id={item.memoId}
      className="group block rounded-xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(item.createdAt)}</span>
        </div>
        {item.cardType && (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20 capitalize">
            {item.cardType.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
          {item.cardName}
        </h3>
        {isMinorArcana && item.suit && item.number && (
          <p className="text-sm text-slate-400">
            {item.number} of {item.suit}
          </p>
        )}
      </div>

      {item.interpretation && (
        <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-2">
          {item.interpretation}
        </p>
      )}

      {item.readingContext && (
        <div className="mb-3">
          <span className="text-xs text-slate-500">Context: </span>
          <span className="text-xs text-slate-400">{item.readingContext}</span>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
