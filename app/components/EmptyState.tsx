"use client";

import { useFilters } from "../contexts/FilterContext";
import { Search, Inbox } from "lucide-react";

interface EmptyStateProps {
  onRecordClick: () => void;
  isProcessing: boolean;
}

export function EmptyState({ onRecordClick, isProcessing }: EmptyStateProps) {
  const { filter, categoryFilter, sizeFilter, resetFilters } = useFilters();

  const hasActiveFilters =
    filter !== "all" || categoryFilter !== "all" || sizeFilter !== "all";

  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <Search className="w-10 h-10 text-slate-500" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-slate-300 mb-3">
          No matching memos
        </h3>
        <p className="text-slate-400 mb-6 max-w-sm">
          No memos match your current filters. Try adjusting your selection or{" "}
          <button
            onClick={resetFilters}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium underline decoration-indigo-400/30 hover:decoration-indigo-300/50"
          >
            clear all filters
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="mb-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center">
            <Inbox className="w-12 h-12 text-slate-500" />
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-slate-300 mb-3">
        Start capturing your thoughts
      </h3>
      <p className="text-slate-400 mb-8 max-w-md">
        <span className="hidden sm:inline">
          Press{" "}
          <kbd className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded">
            Space
          </kbd>{" "}
          or click the record button below to create your first memo
        </span>
        <span className="sm:hidden">
          Tap the record button below to create your first memo
        </span>
      </p>
      <button
        onClick={onRecordClick}
        disabled={isProcessing}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Record Your First Memo
      </button>
    </div>
  );
}
