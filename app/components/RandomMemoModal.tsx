"use client";

import { AlertCircle } from "lucide-react";
import { Memo } from "../types/memo";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
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
  if (!memo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showCloseButton={true}>
      {/* Category & Confidence */}
      <div className="flex items-center gap-3 mb-6">
        <CategoryBadge category={memo.category} mode="expanded" />
        <div className="text-[#64748b] text-sm">
          {formatConfidence(memo.confidence)} confidence
        </div>
        {memo.needs_review && (
          <span
            className="inline-flex h-6 w-6 items-center justify-center text-purple-400"
            title="Needs review"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Needs review</span>
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
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          onClick={onShowAnother}
          variant="unstyled"
          size="lg"
          className="w-full sm:w-auto bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/40 rounded-lg backdrop-blur-xl font-medium transition-all"
        >
          Show Another
        </Button>
        <Button
          onClick={onClose}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
