"use client";

import { Memo } from "../types/memo";
import { CategoryBadge } from "./CategoryBadge";
import { formatConfidence } from "../lib/ui-utils";

interface RandomMemoModalProps {
  isOpen: boolean;
  memo: Memo | null;
  onClose: () => void;
  onShowAnother: () => void;
}

export function RandomMemoModal({
  isOpen,
  memo,
  onClose,
  onShowAnother,
}: RandomMemoModalProps) {
  if (!isOpen || !memo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl" />

      {/* Modal Content - Full screen on mobile, centered on desktop */}
      <div
        className="relative w-full h-full sm:max-w-3xl sm:w-full sm:max-h-[90vh] sm:h-auto overflow-y-auto bg-[#0d0e14] sm:bg-[#0d0e14]/80 sm:border sm:border-slate-700/30 sm:rounded-2xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Larger on mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#1e1f2a]/60 hover:bg-[#1e1f2a] border border-slate-700/30 text-[#94a3b8] hover:text-white transition-all"
        >
          ✕
        </button>

        {/* Category & Confidence */}
        <div className="flex items-center gap-3 mb-6">
          <CategoryBadge category={memo.category} mode="expanded" />
          <div className="text-[#64748b] text-sm">
            {formatConfidence(memo.confidence)} confidence
          </div>
          {memo.needs_review && (
            <span className="text-xs px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/40 rounded-full backdrop-blur-xl">
              Needs Review
            </span>
          )}
        </div>

        {/* Transcript */}
        <div className="text-[#e2e8f0] text-lg leading-relaxed mb-6">
          {memo.transcript}
        </div>

        {/* Timestamp */}
        <div className="text-[#64748b] text-sm mb-6">
          {new Date(memo.timestamp).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>

        {/* Extracted Data */}
        {memo.extracted && (
          <div className="space-y-3 p-4 bg-[#0a0a0f]/40 rounded-lg border border-slate-700/20 mb-6">
            <div className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">
              Extracted Information
            </div>
            {memo.extracted.title && (
              <div>
                <span className="text-[#64748b] font-medium">Title: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.title}</span>
              </div>
            )}
            {memo.extracted.who && (
              <div>
                <span className="text-[#64748b] font-medium">Who: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.who}</span>
              </div>
            )}
            {memo.extracted.when && (
              <div>
                <span className="text-[#64748b] font-medium">When: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.when}</span>
              </div>
            )}
            {memo.extracted.where && (
              <div>
                <span className="text-[#64748b] font-medium">Where: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.where}</span>
              </div>
            )}
            {memo.extracted.what && (
              <div>
                <span className="text-[#64748b] font-medium">Summary: </span>
                <span className="text-[#cbd5e1]">{memo.extracted.what}</span>
              </div>
            )}
            {memo.extracted.actionable && (
              <div className="pt-1">
                <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/40 rounded-full backdrop-blur-xl">
                  🎯 Actionable
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {memo.tags && memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {memo.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#0a0a0f]/60 text-[#94a3b8] border border-slate-700/20 rounded-full text-xs backdrop-blur-xl"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons - Full width on mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onShowAnother}
            className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/40 rounded-lg transition-all backdrop-blur-xl font-medium"
          >
            Show Another
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-[#1e1f2a]/60 hover:bg-[#1e1f2a] text-[#94a3b8] hover:text-white border border-slate-700/30 rounded-lg transition-all backdrop-blur-xl font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
