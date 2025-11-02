"use client";

import {
  getCategoryIcon,
  getCategoryLabel,
  getCategoryIconColor,
} from "../lib/ui-utils";
import { Category } from "../types/memo";
import { categories, FILTER_LABELS } from "../lib/constants";
import { Button } from "./ui/Button";
import { Sparkles } from "lucide-react";

type FilterCategory = Category | "all";

const activeContainerStyles: Record<FilterCategory, string> = {
  all: "bg-slate-500/15 border border-slate-300/40",
  journal: "bg-emerald-500/15 border border-emerald-400/40",
  media: "bg-sky-500/15 border border-sky-400/40",
  event: "bg-amber-500/15 border border-amber-400/40",
  tarot: "bg-purple-500/15 border border-purple-400/40",
  todo: "bg-yellow-500/15 border border-yellow-400/40",
  idea: "bg-violet-500/15 border border-violet-400/40",
  "to buy": "bg-cyan-500/15 border border-cyan-400/40",
  other: "bg-slate-500/15 border border-slate-400/40",
};

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
          cat !== "all" ? getCategoryIcon(cat as Category) : Sparkles;
        const isActive = categoryFilter === cat;

        const inactiveStyles =
          "bg-[#0d0e14]/40 border border-slate-700/30 text-slate-400";
        const activeStyles = activeContainerStyles[cat as FilterCategory];
        const iconColor = isActive
          ? getCategoryIconColor(cat as Category)
          : "text-slate-400";

        return (
          <Button
            key={cat}
            onClick={() => handleCategoryClick(cat as Category | "all")}
            variant="unstyled"
            size="custom"
            aria-pressed={isActive}
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isActive ? activeStyles : inactiveStyles
            }`}
          >
            <IconComponent
              className={`h-4 w-4 ${iconColor}`}
              aria-hidden="true"
            />
            <span className="sr-only">
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
