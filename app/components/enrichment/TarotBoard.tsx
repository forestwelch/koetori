"use client";

import { useState, useMemo } from "react";
import { TarotItem } from "../../types/enrichment";
import { LoadingSpinner } from "../LoadingSpinner";
import {
  Sparkles,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useModals } from "../../contexts/ModalContext";
import { Card } from "../ui/Card";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface TarotBoardProps {
  items: TarotItem[];
  isLoading: boolean;
  error?: Error | null;
}

export function TarotBoard({ items, isLoading, error }: TarotBoardProps) {
  const { setShowMemoModal, setMemoModalId } = useModals();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<
    "all" | "major_arcana" | "minor_arcana"
  >("all");

  // Group items by card name
  const groupedByCard = useMemo(() => {
    const groups: Record<string, TarotItem[]> = {};
    items.forEach((item) => {
      const key = item.cardName || "Unknown";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (filterType === "all") return items;
    return items.filter((item) => item.cardType === filterType);
  }, [items, filterType]);

  // Sort items by date (newest first)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [filteredItems]);

  // Filter grouped items
  const filteredGrouped = useMemo(() => {
    if (selectedCard) {
      return { [selectedCard]: groupedByCard[selectedCard] || [] };
    }
    const filtered: Record<string, TarotItem[]> = {};
    Object.entries(groupedByCard).forEach(([cardName, cardItems]) => {
      const matches = cardItems.filter((item) => {
        if (filterType === "all") return true;
        return item.cardType === filterType;
      });
      if (matches.length > 0) {
        filtered[cardName] = matches;
      }
    });
    return filtered;
  }, [groupedByCard, selectedCard, filterType]);

  const toggleExpanded = (memoId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(memoId)) {
        next.delete(memoId);
      } else {
        next.add(memoId);
      }
      return next;
    });
  };

  const handleViewMemo = (memoId: string) => {
    setMemoModalId(memoId);
    setShowMemoModal(true);
  };

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

  const cardNames = Object.keys(groupedByCard).sort();

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Tarot</h2>
          <p className="text-sm text-slate-400">
            Your tarot card readings and interpretations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Card Filter Dropdown */}
          {cardNames.length > 0 && (
            <div className="relative">
              <select
                value={selectedCard || ""}
                onChange={(e) => setSelectedCard(e.target.value || null)}
                className="appearance-none bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-white pr-8 hover:border-slate-600/50 focus:outline-none focus:border-purple-500/50"
              >
                <option value="">All Cards</option>
                {cardNames.map((cardName) => (
                  <option key={cardName} value={cardName}>
                    {cardName} ({groupedByCard[cardName].length})
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Type Filter */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 p-1">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === "all"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("major_arcana")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === "major_arcana"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Major
            </button>
            <button
              onClick={() => setFilterType("minor_arcana")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === "minor_arcana"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Minor
            </button>
          </div>

          <div className="text-sm text-slate-400">
            {sortedItems.length}{" "}
            {sortedItems.length === 1 ? "reading" : "readings"}
          </div>
        </div>
      </div>

      {/* History View - All Readings */}
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <TarotCard
            key={item.memoId}
            item={item}
            isExpanded={expandedCards.has(item.memoId)}
            onToggleExpand={() => toggleExpanded(item.memoId)}
            onViewMemo={handleViewMemo}
          />
        ))}
      </div>
    </div>
  );
}

interface TarotCardProps {
  item: TarotItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewMemo: (memoId: string) => void;
}

function TarotCard({
  item,
  isExpanded,
  onToggleExpand,
  onViewMemo,
}: TarotCardProps) {
  const isMajorArcana = item.cardType === "major_arcana";
  const isMinorArcana = item.cardType === "minor_arcana";

  return (
    <Card
      variant="default"
      padding="lg"
      interactive
      className="group border-purple-500/20 hover:border-purple-500/40 transition-all"
      data-memo-id={item.memoId}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                {item.cardName}
              </h3>
              {item.cardType && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20 capitalize">
                  {item.cardType.replace("_", " ")}
                </span>
              )}
            </div>
            {isMinorArcana && item.suit && item.number && (
              <p className="text-sm text-slate-400 mb-2">
                {item.number} of {item.suit}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(item.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        {item.interpretation && (
          <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
            <p className="text-sm font-medium text-purple-200 mb-1">
              Interpretation
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isExpanded || item.interpretation.length < 150
                ? item.interpretation
                : `${item.interpretation.substring(0, 150)}...`}
            </p>
            {item.interpretation.length > 150 && (
              <button
                onClick={onToggleExpand}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Reading Context */}
        {item.readingContext && (
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <span className="text-xs text-slate-500 font-medium">
              Context:{" "}
            </span>
            <span className="text-xs text-slate-300">
              {item.readingContext}
            </span>
          </div>
        )}

        {/* Transcript Excerpt / Key Ideas */}
        {item.transcriptExcerpt && (
          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700/30">
            <p className="text-xs font-medium text-slate-400 mb-2">
              From the Reading
            </p>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              &ldquo;
              {isExpanded || item.transcriptExcerpt.length < 200
                ? item.transcriptExcerpt
                : `${item.transcriptExcerpt.substring(0, 200)}...`}
              &rdquo;
            </p>
            {item.transcriptExcerpt.length > 200 && (
              <button
                onClick={onToggleExpand}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isExpanded ? "Show less" : "Show full transcript"}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
          <button
            onClick={() => onViewMemo(item.memoId)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            View Full Memo
          </button>
          <a
            href={`/#memo-${item.memoId}`}
            onClick={(e) => {
              e.stopPropagation();
              // Don't navigate - just open modal
              e.preventDefault();
              onViewMemo(item.memoId);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/40 hover:border-slate-600/50 text-slate-400 hover:text-white text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View in Inbox
          </a>
        </div>
      </div>
    </Card>
  );
}
