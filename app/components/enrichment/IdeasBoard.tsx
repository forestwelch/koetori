"use client";

import { useState } from "react";
import { IdeaItem, IdeaStatus } from "../../types/enrichment";
import { LoadingSpinner } from "../LoadingSpinner";
import { Lightbulb, Calendar, Tag, Filter, ExternalLink } from "lucide-react";
import { useModals } from "../../contexts/ModalContext";
import { Card } from "../ui/Card";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface IdeasBoardProps {
  items: IdeaItem[];
  isLoading: boolean;
  error?: Error | null;
}

const STATUS_COLORS: Record<IdeaStatus, string> = {
  new: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  exploring: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  planning: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  "on-hold": "bg-slate-500/10 text-slate-300 border-slate-500/20",
  archived: "bg-gray-500/10 text-gray-300 border-gray-500/20",
};

const STATUS_LABELS: Record<IdeaStatus, string> = {
  new: "New",
  exploring: "Exploring",
  planning: "Planning",
  "on-hold": "On Hold",
  archived: "Archived",
};

export function IdeasBoard({ items, isLoading, error }: IdeasBoardProps) {
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <LoadingSpinner size="md" message="Loading ideas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-400">
        Failed to load ideas: {error.message}
      </div>
    );
  }

  const filteredItems =
    statusFilter === "all"
      ? items
      : items.filter((item) => item.status === statusFilter);

  const statusCounts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<IdeaStatus, number>
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-8 text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">
          No ideas yet. Record your thoughts and they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Ideas</h2>
          <p className="text-sm text-slate-400">
            Creative ideas and project concepts
          </p>
        </div>
        <div className="text-sm text-slate-400">
          {filteredItems.length} {filteredItems.length === 1 ? "idea" : "ideas"}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
              : "bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50"
          }`}
        >
          All ({items.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([status, label]) => {
          const count = statusCounts[status as IdeaStatus] || 0;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status as IdeaStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? STATUS_COLORS[status as IdeaStatus] + " border"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <IdeaCard key={item.memoId} item={item} />
        ))}
      </div>
    </div>
  );
}

function IdeaCard({ item }: { item: IdeaItem }) {
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
      className="group border-yellow-500/20 hover:border-yellow-500/40 transition-all"
      data-memo-id={item.memoId}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.createdAt)}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-xs border capitalize ${STATUS_COLORS[item.status]}`}
          >
            {STATUS_LABELS[item.status]}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-slate-300 text-sm leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {item.category && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20 capitalize">
              {item.category}
            </span>
          )}
          {item.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-700/30">
          <button
            onClick={handleViewMemo}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            View Full Memo
          </button>
        </div>
      </div>
    </Card>
  );
}
