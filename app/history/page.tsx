"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { Memo, Category } from "../types/memo";
import {
  getCategoryColor,
  getCategoryIcon,
  formatConfidence,
} from "../lib/ui-utils";

export default function HistoryPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "review">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  const loadMemos = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("memos")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filter === "review") {
        query = query.eq("needs_review", true);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading memos:", error);
      } else {
        setMemos(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter]);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  const categories: (Category | "all")[] = [
    "all",
    "media",
    "event",
    "journal",
    "therapy",
    "tarot",
    "todo",
    "idea",
    "other",
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 relative overflow-hidden bg-[#0a0a0f]">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
              Memo History
            </h1>
            <Link
              href="/"
              className="px-4 py-2 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30 text-[#94a3b8] text-sm font-light hover:border-slate-600/50 hover:text-[#cbd5e1] transition-all"
            >
              ← New Memo
            </Link>
          </div>

          {/* Filter Controls */}
          <div className="space-y-4">
            {/* Review Filter */}
            <div className="flex gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-indigo-500 text-white"
                    : "bg-[#14151f]/60 backdrop-blur-xl border border-slate-700/30 text-[#94a3b8] hover:border-slate-600/50"
                }`}
              >
                All Memos ({memos.length})
              </button>
              <button
                onClick={() => setFilter("review")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "review"
                    ? "bg-yellow-500 text-white"
                    : "bg-[#14151f]/60 backdrop-blur-xl border border-slate-700/30 text-[#94a3b8] hover:border-slate-600/50"
                }`}
              >
                ⚠️ Needs Review
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    categoryFilter === cat
                      ? cat === "all"
                        ? "bg-slate-500 text-white border-slate-500"
                        : getCategoryColor(cat as Category)
                      : "bg-[#14151f]/40 backdrop-blur-xl border-slate-700/20 text-[#64748b] hover:border-slate-600/50"
                  }`}
                >
                  {cat === "all"
                    ? "All Categories"
                    : `${getCategoryIcon(cat as Category)} ${cat}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
            <p className="mt-4 text-[#94a3b8] text-sm">Loading memos...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && memos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#64748b] text-lg">
              {filter === "review"
                ? "No memos need review! 🎉"
                : categoryFilter !== "all"
                  ? `No ${categoryFilter} memos yet`
                  : "No memos yet. Record your first one!"}
            </p>
          </div>
        )}

        {/* Memos List */}
        {!loading && memos.length > 0 && (
          <div className="space-y-4">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className="p-4 sm:p-6 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                {/* Header: Category, Confidence, Date */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getCategoryColor(
                      memo.category
                    )}`}
                  >
                    {getCategoryIcon(memo.category)} {memo.category}
                  </span>

                  {/* Confidence */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-[#1e1f2a] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          memo.confidence >= 0.7
                            ? "bg-green-500"
                            : memo.confidence >= 0.5
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                        }`}
                        style={{ width: `${memo.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#94a3b8]">
                      {formatConfidence(memo.confidence)}
                    </span>
                  </div>

                  {/* Review Flag */}
                  {memo.needs_review && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded text-xs font-medium">
                      ⚠️ Review
                    </span>
                  )}

                  {/* Date */}
                  <span className="ml-auto text-xs text-[#64748b]">
                    {new Date(memo.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Transcript */}
                <p className="text-[#cbd5e1] text-sm sm:text-base font-light leading-relaxed mb-3">
                  {memo.transcript}
                </p>

                {/* Extracted Data */}
                {memo.extracted &&
                  (memo.extracted.title ||
                    memo.extracted.who ||
                    memo.extracted.when ||
                    memo.extracted.where ||
                    memo.extracted.what) && (
                    <div className="p-3 bg-[#0a0a0f]/40 rounded-lg space-y-1.5 mb-3 text-sm">
                      {memo.extracted.title && (
                        <div>
                          <span className="text-[#64748b] font-medium">
                            Title:{" "}
                          </span>
                          <span className="text-[#e2e8f0]">
                            {memo.extracted.title}
                          </span>
                        </div>
                      )}
                      {memo.extracted.who && memo.extracted.who.length > 0 && (
                        <div>
                          <span className="text-[#64748b] font-medium">
                            People:{" "}
                          </span>
                          <span className="text-[#cbd5e1]">
                            {memo.extracted.who.join(", ")}
                          </span>
                        </div>
                      )}
                      {memo.extracted.when && (
                        <div>
                          <span className="text-[#64748b] font-medium">
                            When:{" "}
                          </span>
                          <span className="text-[#cbd5e1]">
                            {memo.extracted.when}
                          </span>
                        </div>
                      )}
                      {memo.extracted.where && (
                        <div>
                          <span className="text-[#64748b] font-medium">
                            Where:{" "}
                          </span>
                          <span className="text-[#cbd5e1]">
                            {memo.extracted.where}
                          </span>
                        </div>
                      )}
                      {memo.extracted.what && (
                        <div>
                          <span className="text-[#64748b] font-medium">
                            Summary:{" "}
                          </span>
                          <span className="text-[#cbd5e1]">
                            {memo.extracted.what}
                          </span>
                        </div>
                      )}
                      {memo.extracted.actionable && (
                        <div className="pt-1">
                          <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                            🎯 Actionable
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                {/* Tags */}
                {memo.tags && memo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {memo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#1e1f2a] text-[#94a3b8] border border-slate-700/30 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
