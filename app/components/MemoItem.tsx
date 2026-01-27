"use client";

import { useState, memo } from "react";
import { Memo, Category } from "../types/memo";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import { useMemoExpansion } from "../hooks/useMemoExpansion";

import { CategoryBadge } from "./CategoryBadge";
import {
  Archive,
  Star,
  Edit2,
  AlertCircle,
  Film,
  Bell,
  ShoppingBag,
  CheckSquare,
  BookOpen,
  Sparkles,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { CategorySelector } from "./CategorySelector";
import { Button } from "./ui/Button";
import { useMemoEnrichments } from "../hooks/useMemoEnrichments";
import Link from "next/link";

import { SwipeIndicator } from "./SwipeIndicator";
import { FullRecordingModal } from "./FullRecordingModal";
import { MemoBadges } from "./inbox/MemoBadges";
import { Checkbox } from "./ui/Checkbox";

interface MemoItemProps {
  memo: Memo;
  isNew: boolean;
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  // Summary editing props
  editingSummaryId: string | null;
  summaryEditText: string;
  setSummaryEditText: (text: string) => void;
  startEditSummary: (memo: Memo) => void;
  cancelEditSummary: () => void;
  saveSummary: (id: string) => void;
  softDelete: (id: string) => void;
  toggleStar: (id: string, current: boolean) => void;
  restoreMemo: (id: string, memoData?: Memo) => void;
  hardDelete: (id: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  dismissReview: (memoId: string) => void;
  // Search props
  searchQuery?: string;
  isSearchMode?: boolean;
  // Expansion props
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  // Selection props
  isSelected?: boolean;
  onToggleSelect?: (memoId: string) => void;
}

function MemoItemComponent({
  memo,
  isNew,
  editingId,
  editText,
  setEditText,
  startEdit,
  cancelEdit,
  saveEdit,
  editingSummaryId,
  summaryEditText,
  setSummaryEditText,
  startEditSummary,
  cancelEditSummary,
  saveSummary,
  softDelete,
  toggleStar,
  restoreMemo: _restoreMemo,
  hardDelete: _hardDelete,
  onCategoryChange,
  dismissReview,
  searchQuery,
  isSearchMode = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
  isSelected = false,
  onToggleSelect,
}: MemoItemProps) {
  const { data: enrichments } = useMemoEnrichments(memo.id);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  // Swipe gesture handling
  const {
    swipeX,
    isSwiping,
    handlers: swipeHandlers,
  } = useSwipeGesture(
    () => softDelete(memo.id), // Swipe right = archive
    () => toggleStar(memo.id, memo.starred || false) // Swipe left = star
  );

  // Expansion state handling
  const { isExpanded, toggleExpanded } = useMemoExpansion(
    controlledExpanded,
    onToggleExpand
  );

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
      id={`memo-${memo.id}`}
      className="relative"
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: isSwiping ? "none" : "transform 0.3s ease",
      }}
      {...swipeHandlers}
    >
      <SwipeIndicator swipeX={swipeX} />

      <div
        className={`group relative p-4 sm:p-5 bg-[#0d0e14]/40 backdrop-blur-xl rounded-xl border hover:bg-[#0d0e14]/60 transition-all duration-200 cursor-pointer ${
          isNew
            ? "border-indigo-500/50 shadow-lg shadow-indigo-500/20"
            : "border-slate-700/20 hover:border-slate-600/40"
        } ${isNew ? "animate-in fade-in slide-in-from-top-4" : ""}`}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded ? "Collapse memo details" : "Expand memo details"
        }
        onKeyDown={(e) => {
          // Don't expand/collapse if user is editing something
          if (editingSummaryId === memo.id || editingId === memo.id) {
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        {/* New memo highlight */}
        {isNew && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 pointer-events-none transition-opacity duration-1000 opacity-100" />
        )}

        <div className="relative">
          {/* Compact header - always visible */}
          <div className="flex items-center gap-3">
            {/* Selection checkbox */}
            {onToggleSelect && (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(memo.id)}
                  className="w-5 h-5"
                />
              </div>
            )}

            {/* Category - clickable badge that opens selector when expanded, static badge when collapsed */}
            <div onClick={(e) => e.stopPropagation()}>
              {isExpanded ? (
                <CategorySelector
                  currentCategory={memo.category}
                  memoId={memo.id}
                  onCategoryChange={onCategoryChange}
                />
              ) : (
                <CategoryBadge category={memo.category} />
              )}
            </div>

            {/* Summary and Badges - Inline Editable */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {/* Badges row */}
              <MemoBadges memo={memo} />

              {/* Summary */}
              {editingSummaryId === memo.id ? (
                <input
                  type="text"
                  value={summaryEditText}
                  onChange={(e) => setSummaryEditText(e.target.value)}
                  onBlur={() => saveSummary(memo.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      saveSummary(memo.id);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelEditSummary();
                    } else if (e.key === " ") {
                      e.stopPropagation();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-[#cbd5e1] text-xs sm:text-sm bg-transparent border-b-2 border-indigo-500/70 focus:border-indigo-400 focus:outline-none pb-0.5 mb-1 min-h-[1.5rem]"
                  autoFocus
                />
              ) : (
                <p
                  className="text-[#cbd5e1] text-xs sm:text-sm line-clamp-1 mb-1 cursor-text hover:text-white transition-colors min-h-[1.5rem] border-b-2 border-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditSummary(memo);
                  }}
                  title="Click to edit summary"
                >
                  {isSearchMode && searchQuery
                    ? highlightText(summary, searchQuery)
                    : summary}
                </p>
              )}

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

            {/* Actions - Star or review icon, plus edit/archive */}
            <div
              className="flex items-center gap-1 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {!isEditing && (
                <Button
                  onClick={() => {
                    if (!isExpanded) {
                      if (!isExpanded && onToggleExpand) {
                        onToggleExpand();
                      } else if (!isExpanded) {
                        setLocalExpanded(true);
                      }
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
              {memo.needs_review ? (
                <Button
                  onClick={() => dismissReview(memo.id)}
                  variant="unstyled"
                  size="custom"
                  aria-label="Mark as reviewed"
                  className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              ) : (
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
              )}
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
                  {/* Transcript display - excerpt if from split recording, full otherwise */}
                  {memo.transcript !== summary && (
                    <>
                      <p
                        className={`text-[#cbd5e1] text-sm mb-2 ${
                          memo.transcription_id && memo.transcript_excerpt
                            ? "line-clamp-2"
                            : ""
                        }`}
                      >
                        {isSearchMode && searchQuery
                          ? highlightText(
                              memo.transcription_id && memo.transcript_excerpt
                                ? memo.transcript_excerpt
                                : memo.transcript,
                              searchQuery
                            )
                          : memo.transcription_id && memo.transcript_excerpt
                            ? memo.transcript_excerpt
                            : memo.transcript}
                      </p>

                      {/* View Full Recording Button - Integrated with transcript */}
                      {memo.transcription_id && memo.transcript_excerpt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsRecordingModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-indigo-400/70 hover:text-indigo-300 transition-colors mt-1.5 border-b border-indigo-400/30 hover:border-indigo-400/50"
                        >
                          View full recording
                        </button>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                {/* Review flag */}
                {memo.needs_review && (
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center text-purple-400"
                    title="Needs review"
                  >
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">Needs review</span>
                  </span>
                )}

                {/* Date */}
                <span className="text-[#64748b]">
                  {new Date(memo.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>

                {/* Confidence - Very discreet, bottom right */}
                <span
                  className="ml-auto text-[#64748b]/60 text-[10px] font-mono"
                  title={`Confidence: ${Math.round(memo.confidence * 100)}%`}
                >
                  {Math.round(memo.confidence * 100)}%
                </span>
              </div>

              {/* Extracted Data - Only show if we have actual content */}
              {memo.extracted &&
                ((memo.extracted.title && memo.category === "media") ||
                  (memo.extracted.who &&
                    Array.isArray(memo.extracted.who) &&
                    memo.extracted.who.length > 0) ||
                  memo.extracted.when ||
                  memo.extracted.where) && (
                  <div className="mb-2 p-2 bg-[#0a0a0f]/60 backdrop-blur-xl rounded-lg border border-slate-700/10 space-y-1 text-xs">
                    {memo.extracted.title && memo.category === "media" && (
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
                    {memo.extracted.who &&
                      Array.isArray(memo.extracted.who) &&
                      memo.extracted.who.length > 0 && (
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

              {/* Enrichment Links - Show dashboards this memo is in */}
              {enrichments && Object.values(enrichments).some((v) => v) && (
                <div className="mt-3 pt-3 border-t border-slate-700/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-medium text-slate-400">
                      View in Dashboard:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {enrichments.hasMedia && (
                      <Link
                        href={`/dashboard/media?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md text-xs transition-colors"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Media</span>
                      </Link>
                    )}
                    {enrichments.hasReminder && (
                      <Link
                        href={`/dashboard/reminders?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-xs transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Reminders</span>
                      </Link>
                    )}
                    {enrichments.hasShopping && (
                      <Link
                        href={`/dashboard/shopping?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-xs transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Shopping</span>
                      </Link>
                    )}
                    {enrichments.hasTodo && (
                      <Link
                        href={`/dashboard/todos?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md text-xs transition-colors"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Todos</span>
                      </Link>
                    )}
                    {enrichments.hasJournal && (
                      <Link
                        href={`/dashboard/journal?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-xs transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Journal</span>
                      </Link>
                    )}
                    {enrichments.hasTarot && (
                      <Link
                        href={`/dashboard/tarot?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-md text-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tarot</span>
                      </Link>
                    )}
                    {enrichments.hasIdea && (
                      <Link
                        href={`/dashboard/ideas?memoId=${memo.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-md text-xs transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Ideas</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Recording Modal */}
      {memo.transcription_id && (
        <FullRecordingModal
          isOpen={isRecordingModalOpen}
          onClose={() => setIsRecordingModalOpen(false)}
          currentMemo={memo}
        />
      )}
    </div>
  );
}

// Custom comparison function to optimize re-renders
function arePropsEqual(prevProps: MemoItemProps, nextProps: MemoItemProps) {
  // Always re-render if it's the new memo
  if (prevProps.isNew !== nextProps.isNew) return false;

  // Re-render if memo content changed
  if (prevProps.memo.id !== nextProps.memo.id) return false;
  if (prevProps.memo.transcript !== nextProps.memo.transcript) return false;
  if (prevProps.memo.extracted?.what !== nextProps.memo.extracted?.what)
    return false;
  if (prevProps.memo.category !== nextProps.memo.category) return false;
  if (prevProps.memo.starred !== nextProps.memo.starred) return false;
  if (prevProps.memo.needs_review !== nextProps.memo.needs_review) return false;
  if (prevProps.memo.deleted_at !== nextProps.memo.deleted_at) return false;

  // Re-render if this memo is being edited
  if (
    prevProps.editingId !== nextProps.editingId ||
    prevProps.editingSummaryId !== nextProps.editingSummaryId
  ) {
    if (
      prevProps.memo.id === prevProps.editingId ||
      prevProps.memo.id === nextProps.editingId ||
      prevProps.memo.id === prevProps.editingSummaryId ||
      prevProps.memo.id === nextProps.editingSummaryId
    ) {
      return false;
    }
  }

  // Re-render if edit text changed (only matters if editing this memo)
  if (prevProps.memo.id === nextProps.editingId) {
    if (prevProps.editText !== nextProps.editText) return false;
  }

  // Re-render if summary text changed (only matters if editing this memo's summary)
  if (prevProps.memo.id === nextProps.editingSummaryId) {
    if (prevProps.summaryEditText !== nextProps.summaryEditText) return false;
  }

  // Re-render if search query or mode changed
  if (prevProps.searchQuery !== nextProps.searchQuery) return false;
  if (prevProps.isSearchMode !== nextProps.isSearchMode) return false;

  // Re-render if expansion state changed
  if (prevProps.isExpanded !== nextProps.isExpanded) return false;

  // Re-render if selection state changed
  if (prevProps.isSelected !== nextProps.isSelected) return false;

  // Otherwise, don't re-render (props are equal)
  return true;
}

// Export memoized component
export const MemoItem = memo(MemoItemComponent, arePropsEqual);
