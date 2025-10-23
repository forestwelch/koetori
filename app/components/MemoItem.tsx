"use client";

import { useState, useRef } from "react";
import { Memo, Category } from "../types/memo";

import { CategoryBadge } from "./CategoryBadge";
import { Archive, Star, Edit2 } from "lucide-react";
import { CategorySelector } from "./CategorySelector";
import { Button } from "./ui/Button";

import { MemoActions } from "./MemoActions";
import { SwipeIndicator } from "./SwipeIndicator";

interface MemoItemProps {
  memo: Memo;
  isNew: boolean;
  filter: "all" | "review" | "archive" | "starred";
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  softDelete: (id: string) => void;
  toggleStar: (id: string, current: boolean) => void;
  restoreMemo: (id: string) => void;
  hardDelete: (id: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  // Search props
  searchQuery?: string;
  isSearchMode?: boolean;
}

export function MemoItem({
  memo,
  isNew,
  filter,
  editingId,
  editText,
  setEditText,
  startEdit,
  cancelEdit,
  saveEdit,
  softDelete,
  toggleStar,
  restoreMemo,
  hardDelete,
  onCategoryChange,
  searchQuery,
  isSearchMode = false,
}: MemoItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (filter === "archive") return;
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || filter === "archive") return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Prevent page scroll when swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }

    setSwipeX(diff);
  };

  const handleTouchEnd = () => {
    if (filter === "archive") return;
    if (Math.abs(swipeX) > 100) {
      if (swipeX < 0) {
        toggleStar(memo.id, memo.starred || false);
      } else {
        softDelete(memo.id);
      }
    }
    setSwipeX(0);
    setIsSwiping(false);
  };

  const isEditing = editingId === memo.id;
  const summary = memo.extracted?.what || memo.transcript.slice(0, 100);

  // Search highlighting function
  const highlightText = (text: string, query?: string) => {
    if (!query?.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark
            key={index}
            className="bg-violet-500/30 text-violet-200 rounded px-0.5"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Get transcript excerpt for search mode
  const getTranscriptExcerpt = () => {
    if (!searchQuery || !isSearchMode) return null;

    const transcriptContainsQuery = memo.transcript
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!transcriptContainsQuery) return null;

    const queryIndex = memo.transcript
      .toLowerCase()
      .indexOf(searchQuery.toLowerCase());
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(
      memo.transcript.length,
      queryIndex + searchQuery.length + 50
    );
    const excerpt = memo.transcript.slice(start, end);

    return (
      (start > 0 ? "..." : "") +
      excerpt +
      (end < memo.transcript.length ? "..." : "")
    );
  };

  const transcriptExcerpt = getTranscriptExcerpt();

  return (
    <div
      className="relative"
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: isSwiping ? "none" : "transform 0.3s ease",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SwipeIndicator swipeX={swipeX} />

      <div
        className={`group relative p-3 sm:p-4 bg-[#0d0e14]/40 backdrop-blur-xl rounded-xl border hover:bg-[#0d0e14]/60 transition-all duration-200 cursor-pointer ${
          isNew
            ? "border-indigo-500/50 shadow-lg shadow-indigo-500/20"
            : "border-slate-700/20 hover:border-slate-600/40"
        } ${isNew ? "animate-in fade-in slide-in-from-top-4" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* New memo highlight */}
        {isNew && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 pointer-events-none transition-opacity duration-1000 opacity-100" />
        )}

        <div className="relative">
          {/* Compact header - always visible */}
          <div className="flex items-center gap-3">
            {/* Category - clickable badge that opens selector when expanded, static badge when collapsed */}
            <div onClick={(e) => e.stopPropagation()}>
              {isExpanded && filter !== "archive" ? (
                <CategorySelector
                  currentCategory={memo.category}
                  memoId={memo.id}
                  onCategoryChange={onCategoryChange}
                />
              ) : (
                <CategoryBadge category={memo.category} />
              )}
            </div>

            {/* Summary */}
            <div className="flex-1 min-w-0">
              <p className="text-[#cbd5e1] text-xs sm:text-sm line-clamp-1 mb-1">
                {isSearchMode && searchQuery
                  ? highlightText(summary, searchQuery)
                  : summary}
              </p>

              {/* Search mode: Show additional matches in contracted view */}
              {isSearchMode && searchQuery && (
                <div className="space-y-1 text-xs">
                  {/* Transcript excerpt if it contains query and summary doesn't */}
                  {transcriptExcerpt &&
                    !memo.extracted?.what
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) && (
                      <div className="text-slate-400">
                        <span className="font-medium">From transcript: </span>
                        <span className="text-slate-300">
                          {highlightText(transcriptExcerpt, searchQuery)}
                        </span>
                      </div>
                    )}

                  {/* Show people matches */}
                  {memo.extracted?.who?.some((person) =>
                    person.toLowerCase().includes(searchQuery.toLowerCase())
                  ) && (
                    <div className="text-slate-400">
                      <span className="font-medium">People: </span>
                      <span>
                        {highlightText(
                          memo.extracted.who.join(", "),
                          searchQuery
                        )}
                      </span>
                    </div>
                  )}

                  {/* Show tag matches */}
                  {memo.tags?.some((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                  ) && (
                    <div className="text-slate-400">
                      <span className="font-medium">Tags: </span>
                      <span>
                        {highlightText(memo.tags.join(", "), searchQuery)}
                      </span>
                    </div>
                  )}

                  {/* Show extracted field matches */}
                  {memo.extracted?.title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) && (
                    <div className="text-slate-400">
                      <span className="font-medium">Title: </span>
                      <span>
                        {highlightText(memo.extracted.title, searchQuery)}
                      </span>
                    </div>
                  )}

                  {memo.extracted?.when
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) && (
                    <div className="text-slate-400">
                      <span className="font-medium">When: </span>
                      <span>
                        {highlightText(memo.extracted.when, searchQuery)}
                      </span>
                    </div>
                  )}

                  {memo.extracted?.where
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) && (
                    <div className="text-slate-400">
                      <span className="font-medium">Where: </span>
                      <span>
                        {highlightText(memo.extracted.where, searchQuery)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions - Star always visible, Edit and Archive on desktop hover only */}
            <div
              className="flex items-center gap-1 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {filter !== "archive" ? (
                <>
                  {!isEditing && (
                    <Button
                      onClick={() => {
                        if (!isExpanded) {
                          setIsExpanded(true);
                        }
                        startEdit(memo);
                      }}
                      variant="unstyled"
                      size="custom"
                      aria-label="Edit"
                      className="hidden sm:block p-1.5 hover:bg-slate-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  )}
                  <Button
                    onClick={() => softDelete(memo.id)}
                    variant="unstyled"
                    size="custom"
                    aria-label="Archive"
                    className="hidden sm:block p-1.5 hover:bg-slate-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Archive className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button
                    onClick={() => toggleStar(memo.id, memo.starred || false)}
                    variant="unstyled"
                    size="custom"
                    aria-label={memo.starred ? "Unstar" : "Star"}
                    className="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${memo.starred ? "text-amber-400 fill-amber-400" : "text-slate-400"}`}
                    />
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2 pt-2 border-t border-slate-700/20"
            >
              {/* Full transcript or edit mode */}
              {isEditing ? (
                <div className="mb-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 bg-[#0a0a0f]/60 backdrop-blur-xl border border-indigo-500/50 rounded-lg text-[#cbd5e1] text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => saveEdit(memo.id)}
                      variant="unstyled"
                      size="custom"
                      className="px-2 py-1 bg-indigo-500/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-all"
                    >
                      ✓ Save
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="unstyled"
                      size="custom"
                      className="px-2 py-1 bg-[#14151f]/60 hover:bg-[#14151f]/80 text-[#94a3b8] border border-slate-700/30 rounded-lg text-xs font-medium transition-all"
                    >
                      ✕ Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Full transcript (when expanded and different from summary) */}
                  {memo.transcript !== summary && (
                    <p className="text-[#cbd5e1] text-sm mb-2">
                      {isSearchMode && searchQuery
                        ? highlightText(memo.transcript, searchQuery)
                        : memo.transcript}
                    </p>
                  )}
                </>
              )}

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                {/* Confidence */}
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 bg-[#0a0a0f]/80 backdrop-blur-xl rounded-full overflow-hidden border border-slate-700/10">
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
                  <span className="text-[#94a3b8]">
                    {Math.round(memo.confidence * 100)}%
                  </span>
                </div>

                {/* Review flag */}
                {memo.needs_review && (
                  <span className="px-1.5 py-0.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/40 rounded text-xs">
                    ⚠️ Review
                  </span>
                )}

                {/* Actionable flag */}
                {memo.extracted?.actionable && (
                  <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/40 rounded text-xs">
                    🎯 Actionable
                  </span>
                )}

                {/* Task Size - visible on mobile in expanded view */}
                {memo.size && (
                  <span className="px-1.5 py-0.5 bg-slate-700/30 text-slate-300 border border-slate-600/30 rounded text-xs font-medium">
                    {memo.size}
                  </span>
                )}

                {/* Date */}
                <span className="ml-auto text-[#64748b]">
                  {new Date(memo.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Extracted Data */}
              {memo.extracted &&
                (memo.extracted.title ||
                  memo.extracted.who ||
                  memo.extracted.when ||
                  memo.extracted.where) && (
                  <div className="mb-2 p-2 bg-[#0a0a0f]/60 backdrop-blur-xl rounded-lg border border-slate-700/10 space-y-1 text-xs">
                    {memo.extracted.title && (
                      <div>
                        <span className="text-[#64748b] font-medium">
                          Title:{" "}
                        </span>
                        <span className="text-[#e2e8f0]">
                          {isSearchMode && searchQuery
                            ? highlightText(memo.extracted.title, searchQuery)
                            : memo.extracted.title}
                        </span>
                      </div>
                    )}
                    {memo.extracted.who && memo.extracted.who.length > 0 && (
                      <div>
                        <span className="text-[#64748b] font-medium">
                          People:{" "}
                        </span>
                        <span className="text-[#cbd5e1]">
                          {isSearchMode && searchQuery
                            ? highlightText(
                                memo.extracted.who.join(", "),
                                searchQuery
                              )
                            : memo.extracted.who.join(", ")}
                        </span>
                      </div>
                    )}
                    {memo.extracted.when && (
                      <div>
                        <span className="text-[#64748b] font-medium">
                          When:{" "}
                        </span>
                        <span className="text-[#cbd5e1]">
                          {isSearchMode && searchQuery
                            ? highlightText(memo.extracted.when, searchQuery)
                            : memo.extracted.when}
                        </span>
                      </div>
                    )}
                    {memo.extracted.where && (
                      <div>
                        <span className="text-[#64748b] font-medium">
                          Where:{" "}
                        </span>
                        <span className="text-[#cbd5e1]">
                          {isSearchMode && searchQuery
                            ? highlightText(memo.extracted.where, searchQuery)
                            : memo.extracted.where}
                        </span>
                      </div>
                    )}
                  </div>
                )}

              {/* Tags */}
              {memo.tags && memo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {memo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-[#0a0a0f]/60 text-[#94a3b8] border border-slate-700/20 rounded text-xs backdrop-blur-xl"
                    >
                      #
                      {isSearchMode && searchQuery
                        ? highlightText(tag, searchQuery)
                        : tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Archive actions (only in archive view) */}
              {filter === "archive" && (
                <MemoActions
                  memo={memo}
                  filter={filter}
                  isEditing={isEditing}
                  startEdit={startEdit}
                  toggleStar={toggleStar}
                  handleArchive={softDelete}
                  handleRestore={restoreMemo}
                  handleDeleteForever={hardDelete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
