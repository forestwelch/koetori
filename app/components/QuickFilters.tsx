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
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all backdrop-blur-xl whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? cat === "all"
                  ? "bg-slate-500/30 text-white border border-slate-500/50"
                  : `${getCategoryColor(cat as Category).split(" ")[0]} text-white border border-current`
                : "bg-[#0d0e14]/40 border border-slate-700/20 text-[#cbd5e1] hover:bg-[#0d0e14]/60"
            }`}
          >
            {IconComponent && (
              <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>
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
