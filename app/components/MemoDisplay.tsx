"use client";

import { Category, ExtractedData } from "../types/memo";
import {
  getCategoryColor,
  getCategoryIcon,
  formatConfidence,
} from "../lib/ui-utils";

interface MemoDisplayProps {
  transcript: string;
  category: Category;
  confidence: number;
  needsReview: boolean;
  extracted: ExtractedData;
  tags: string[];
}

export function MemoDisplay({
  transcript,
  category,
  confidence,
  needsReview,
  extracted,
  tags,
}: MemoDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Category Badge & Confidence */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getCategoryColor(
            category
          )}`}
        >
          {getCategoryIcon(category)} {category}
        </span>

        {/* Confidence Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-20 sm:w-24 h-2 bg-[#1e1f2a] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                confidence >= 0.7
                  ? "bg-green-500"
                  : confidence >= 0.5
                  ? "bg-yellow-500"
                  : "bg-orange-500"
              }`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm text-[#94a3b8]">
            {formatConfidence(confidence)}
          </span>
        </div>

        {/* Review Flag */}
        {needsReview && (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded text-xs font-medium">
            ⚠️ Needs Review
          </span>
        )}
      </div>

      {/* Transcript */}
      <div className="p-4 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30">
        <p className="text-sm sm:text-base text-[#cbd5e1] font-light leading-relaxed">
          {transcript}
        </p>
      </div>

      {/* Extracted Data */}
      {(extracted.title ||
        extracted.who ||
        extracted.when ||
        extracted.where ||
        extracted.what) && (
        <div className="p-4 bg-[#14151f]/40 backdrop-blur-xl rounded-xl border border-slate-700/20 space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-[#94a3b8] font-medium mb-3">
            Extracted Information
          </h4>

          {extracted.title && (
            <div className="flex gap-2">
              <span className="text-[#64748b] text-sm font-medium min-w-[60px]">
                Title:
              </span>
              <span className="text-[#e2e8f0] text-sm font-medium">
                {extracted.title}
              </span>
            </div>
          )}

          {extracted.who && extracted.who.length > 0 && (
            <div className="flex gap-2">
              <span className="text-[#64748b] text-sm font-medium min-w-[60px]">
                People:
              </span>
              <span className="text-[#cbd5e1] text-sm">
                {extracted.who.join(", ")}
              </span>
            </div>
          )}

          {extracted.when && (
            <div className="flex gap-2">
              <span className="text-[#64748b] text-sm font-medium min-w-[60px]">
                When:
              </span>
              <span className="text-[#cbd5e1] text-sm">{extracted.when}</span>
            </div>
          )}

          {extracted.where && (
            <div className="flex gap-2">
              <span className="text-[#64748b] text-sm font-medium min-w-[60px]">
                Where:
              </span>
              <span className="text-[#cbd5e1] text-sm">{extracted.where}</span>
            </div>
          )}

          {extracted.what && (
            <div className="flex gap-2">
              <span className="text-[#64748b] text-sm font-medium min-w-[60px]">
                Summary:
              </span>
              <span className="text-[#cbd5e1] text-sm">{extracted.what}</span>
            </div>
          )}

          {extracted.actionable && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30">
              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                🎯 Actionable
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[#1e1f2a] text-[#94a3b8] border border-slate-700/30 rounded-lg text-xs font-light hover:border-slate-600/50 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
