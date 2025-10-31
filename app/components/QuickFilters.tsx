"use client";

import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../lib/ui-utils";
import { Category } from "../types/memo";
import { categories, FILTER_LABELS } from "../lib/constants";
import { Button } from "./ui/Button";

interface QuickFiltersProps {
  categoryFilter: Category | "all";
  setCategoryFilter: (category: Category | "all") => void;
  isSpotlighted?: boolean;
  onFilterClick?: () => void;
}

export function QuickFilters({
  categoryFilter,
  setCategoryFilter,
  isSpotlighted = false,
  onFilterClick,
}: QuickFiltersProps) {
  const handleCategoryClick = (newCategory: Category | "all") => {
    setCategoryFilter(newCategory);
    if (isSpotlighted && onFilterClick) {
      onFilterClick();
    }
  };

  // Desktop Grid View (lg and up) - Categories only
  return (
    <div className="hidden lg:flex gap-2 flex-wrap items-center">
      {categories.map((cat) => {
        const IconComponent =
          cat !== "all" ? getCategoryIcon(cat as Category) : null;
        const isActive = categoryFilter === cat;

        return (
          <Button
            key={cat}
            onClick={() => handleCategoryClick(cat as Category | "all")}
            variant="unstyled"
            size="custom"
            className={`group relative flex items-center gap-2 overflow-hidden rounded-full border px-2 py-1 text-xs font-medium transition-all duration-300 ${
              isActive
                ? cat === "all"
                  ? "border-slate-300/70 bg-slate-500/20 text-white shadow-[0_0_20px_rgba(148,163,184,0.4)]"
                  : `${getCategoryColor(cat as Category).split(" ")[0]} text-white shadow-[0_0_22px_rgba(94,234,212,0.35)]`
                : "border-slate-700/50 bg-[#0d0e14]/50 text-slate-300 hover:border-slate-500/60 hover:bg-[#131622]/70"
            }`}
          >
            {IconComponent && (
              <IconComponent className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="max-w-0 overflow-hidden whitespace-nowrap pl-1 text-[11px] transition-all duration-300 group-hover:max-w-[120px] group-hover:pl-2">
              {cat === "all"
                ? FILTER_LABELS.CATEGORY_ALL
                : getCategoryLabel(cat as Category)}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
