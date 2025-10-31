"use client";

import { X } from "lucide-react";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../lib/ui-utils";
import { Category } from "../types/memo";
import { categories, FILTER_LABELS } from "../lib/constants";
import { Button } from "./ui/Button";

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categoryFilter: Category | "all";
  setCategoryFilter: (category: Category | "all") => void;
}

export function FiltersDrawer({
  isOpen,
  onClose,
  categoryFilter,
  setCategoryFilter,
}: FiltersDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-slate-700/40 rounded-t-2xl shadow-2xl transition-transform duration-300 z-50 lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-6 pb-8 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#e2e8f0]">Filters</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#94a3b8]" />
            </button>
          </div>

          {/* Category Filter Section */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#64748b] font-medium mb-3">
              Category
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    onClose();
                  }}
                  variant="unstyled"
                  size="custom"
                  className={`w-full px-4 py-3 text-sm text-left justify-start rounded-xl transition-all ${
                    categoryFilter === cat
                      ? cat === "all"
                        ? "bg-slate-500/30 text-white border border-slate-500/50"
                        : `${getCategoryColor(cat as Category).split(" ")[0]} text-white border border-current`
                      : "bg-[#0d0e14]/40 text-slate-300 hover:bg-slate-700/30 border border-slate-700/20"
                  }`}
                >
                  {cat === "all" ? (
                    FILTER_LABELS.CATEGORY_ALL
                  ) : (
                    <>
                      {(() => {
                        const IconComponent = getCategoryIcon(cat as Category);
                        return (
                          <IconComponent className="w-4 h-4 inline mr-2" />
                        );
                      })()}
                      {getCategoryLabel(cat as Category)}
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
