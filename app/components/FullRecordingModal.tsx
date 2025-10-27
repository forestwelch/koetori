"use client";

import { useState, useMemo } from "react";
import { Modal } from "./ui/Modal";
import { Memo } from "../types/memo";
import { useRelatedMemos } from "../hooks/useRelatedMemos";
import { CategoryBadge } from "./CategoryBadge";
import { LoadingSpinner } from "./LoadingSpinner";

interface FullRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMemo: Memo;
}

export function FullRecordingModal({
  isOpen,
  onClose,
  currentMemo,
}: FullRecordingModalProps) {
  const [selectedMemoId, setSelectedMemoId] = useState(currentMemo.id);

  const { data: relatedMemos = [], isLoading } = useRelatedMemos(
    currentMemo.transcription_id
  );

  // Find the selected memo from the list
  const selectedMemo =
    relatedMemos.find((m) => m.id === selectedMemoId) || currentMemo;

  // Highlight the relevant excerpt in the full transcript
  const highlightedTranscript = useMemo(() => {
    if (!selectedMemo.transcript_excerpt) {
      return currentMemo.transcript;
    }

    const excerpt = selectedMemo.transcript_excerpt.trim();
    const transcript = currentMemo.transcript;

    // Find the excerpt in the transcript (case-insensitive, flexible whitespace)
    const excerptWords = excerpt.split(/\s+/);
    const transcriptWords = transcript.split(/\s+/);

    // Simple highlighting: find the excerpt and wrap it
    const excerptIndex = transcript
      .toLowerCase()
      .indexOf(excerpt.toLowerCase());

    if (excerptIndex === -1) {
      // If exact match not found, just return the transcript
      return transcript;
    }

    const before = transcript.slice(0, excerptIndex);
    const highlighted = transcript.slice(
      excerptIndex,
      excerptIndex + excerpt.length
    );
    const after = transcript.slice(excerptIndex + excerpt.length);

    return (
      <>
        {before}
        <span className="bg-indigo-500/30 text-indigo-200 px-1 rounded">
          {highlighted}
        </span>
        {after}
      </>
    );
  }, [currentMemo.transcript, selectedMemo.transcript_excerpt]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Full Recording">
      <div className="space-y-6">
        {/* Full Transcript Section */}
        <div>
          <h3 className="text-sm font-medium text-[#94a3b8] mb-2">
            Full Transcript
          </h3>
          <div className="p-4 bg-[#0a0a0f]/60 backdrop-blur-xl border border-slate-700/30 rounded-xl max-h-64 overflow-y-auto">
            <p className="text-[#cbd5e1] text-sm leading-relaxed whitespace-pre-wrap">
              {highlightedTranscript}
            </p>
          </div>
        </div>

        {/* Related Memos Section */}
        <div>
          <h3 className="text-sm font-medium text-[#94a3b8] mb-2">
            Memos from this recording ({relatedMemos.length})
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="space-y-2">
              {relatedMemos.map((memo) => {
                const isSelected = memo.id === selectedMemoId;
                const isExpanded = isSelected;

                return (
                  <div
                    key={memo.id}
                    className={`border rounded-xl transition-all ${
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/5"
                        : "border-slate-700/30 bg-[#0a0a0f]/40"
                    }`}
                  >
                    {/* Memo Header */}
                    <button
                      onClick={() => setSelectedMemoId(memo.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#0a0a0f]/40 transition-colors rounded-xl"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#e2e8f0] text-sm font-medium truncate">
                              {memo.extracted?.what || "Memo"}
                            </span>
                            <CategoryBadge category={memo.category} />
                            {memo.starred && <span>⭐</span>}
                          </div>
                          {!isExpanded && memo.transcript_excerpt && (
                            <p className="text-xs text-[#94a3b8] mt-1 line-clamp-1">
                              {memo.transcript_excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Memo Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30 pt-3">
                        {/* Excerpt */}
                        {memo.transcript_excerpt && (
                          <div>
                            <p className="text-sm text-[#cbd5e1] leading-relaxed">
                              {memo.transcript_excerpt}
                            </p>
                          </div>
                        )}

                        {/* Extracted Data */}
                        {memo.extracted && (
                          <div className="space-y-1 text-xs">
                            {memo.extracted.title && (
                              <div>
                                <span className="text-[#64748b]">Title: </span>
                                <span className="text-[#e2e8f0]">
                                  {memo.extracted.title}
                                </span>
                              </div>
                            )}
                            {memo.extracted.who &&
                              memo.extracted.who.length > 0 && (
                                <div>
                                  <span className="text-[#64748b]">
                                    People:{" "}
                                  </span>
                                  <span className="text-[#cbd5e1]">
                                    {memo.extracted.who.join(", ")}
                                  </span>
                                </div>
                              )}
                            {memo.extracted.when && (
                              <div>
                                <span className="text-[#64748b]">When: </span>
                                <span className="text-[#cbd5e1]">
                                  {memo.extracted.when}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {memo.tags && memo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {memo.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-[#0a0a0f]/60 text-[#94a3b8] border border-slate-700/20 rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Confidence */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#64748b]">Confidence:</span>
                          <div className="flex-1 max-w-[100px] bg-slate-700/30 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${memo.confidence * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[#cbd5e1]">
                            {Math.round(memo.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
