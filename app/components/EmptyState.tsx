"use client";

import { useFilters } from "../contexts/FilterContext";

interface EmptyStateProps {
  onRecordClick: () => void;
  isProcessing: boolean;
}

export function EmptyState({ onRecordClick, isProcessing }: EmptyStateProps) {
  const { filter, categoryFilter, sizeFilter, resetFilters } = useFilters();

  const hasActiveFilters =
    filter !== "all" || categoryFilter !== "all" || sizeFilter !== "all";

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="mb-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full" />
          <svg
            className="w-32 h-32 text-[#4a5568] relative"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-xl text-[#cbd5e1] mb-2">
        {hasActiveFilters ? "No matching memos" : "No memos yet"}
      </h3>
      <p className="text-[#64748b] mb-6">
        {hasActiveFilters ? (
          <>
            No memos match these filters.{" "}
            <button
              onClick={resetFilters}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Clear filters
            </button>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">
              Click the record button or press Space to create your first memo
            </span>
            <span className="sm:hidden">
              Click the record button to create your first memo
            </span>
          </>
        )}
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
