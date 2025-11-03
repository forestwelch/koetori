"use client";

import { useState } from "react";
import { Memo, Category } from "../../types/memo";
import { Button } from "../ui/Button";
import { Archive, Tag, CheckCircle2, X } from "lucide-react";
import { getCategoryIcon, getCategoryIconColor } from "../../lib/ui-utils";

interface QuickActionsProps {
  selectedMemos: string[];
  memos: Memo[];
  onBulkArchive: (ids: string[]) => void;
  onBulkCategorize: (ids: string[], category: Category) => void;
  onBulkMarkReviewed: (ids: string[]) => void;
  onClearSelection: () => void;
}

export function QuickActions({
  selectedMemos,
  memos,
  onBulkArchive,
  onBulkCategorize,
  onBulkMarkReviewed,
  onClearSelection,
}: QuickActionsProps) {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (selectedMemos.length === 0) return null;

  const selectedCount = selectedMemos.length;
  const selectedMemosData = memos.filter((m) => selectedMemos.includes(m.id));

  const handleQuickCategorize = (category: Category) => {
    onBulkCategorize(selectedMemos, category);
    setShowCategoryMenu(false);
  };

  return (
    <div className="sticky top-0 z-10 bg-[#0d0e14]/95 backdrop-blur-sm border-b border-slate-800/50 py-3 px-4 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            <strong className="text-slate-200">{selectedCount}</strong> memo
            {selectedCount !== 1 ? "s" : ""} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Categorize */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="text-xs"
            >
              <Tag className="w-3 h-3 mr-1.5" />
              Categorize
            </Button>

            {showCategoryMenu && (
              <div className="absolute top-full right-0 mt-2 bg-[#0d0e14] border border-slate-700/50 rounded-lg shadow-xl p-2 z-20 min-w-[200px]">
                <div className="space-y-1">
                  {[
                    { value: "media" as Category, label: "Media" },
                    { value: "event" as Category, label: "Event" },
                    { value: "journal" as Category, label: "Journal" },
                    { value: "tarot" as Category, label: "Tarot" },
                    { value: "todo" as Category, label: "To Do" },
                    { value: "idea" as Category, label: "Idea" },
                    { value: "to buy" as Category, label: "To Buy" },
                    { value: "other" as Category, label: "Other" },
                  ].map((cat) => {
                    const Icon = getCategoryIcon(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() => handleQuickCategorize(cat.value)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-slate-300 hover:bg-slate-700/30 transition-colors"
                      >
                        <Icon
                          className={`h-4 w-4 ${getCategoryIconColor(cat.value)}`}
                        />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowCategoryMenu(false)}
                  className="mt-2 w-full text-xs text-slate-400 hover:text-slate-300 text-center pt-2 border-t border-slate-700/50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Mark Reviewed */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkMarkReviewed(selectedMemos)}
            className="text-xs"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            Mark Reviewed
          </Button>

          {/* Archive */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkArchive(selectedMemos)}
            className="text-xs text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
          >
            <Archive className="w-3 h-3 mr-1.5" />
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
}
