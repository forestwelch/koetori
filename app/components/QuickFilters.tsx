"use client";

import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../lib/ui-utils";
import { Category } from "../types/memo";
import { categories, FILTER_LABELS } from "../lib/constants";
import { Button } from "./ui/Button";
import { useRef } from "react";
import {
  VIEW_FILTERS,
  CATEGORY_FILTERS,
  SIZE_FILTERS,
  CATEGORY_ORDER,
} from "../lib/filterMetadata";

interface QuickFiltersProps {
  filter: "all" | "review" | "archive" | "starred";
  setFilter: (filter: "all" | "review" | "archive" | "starred") => void;
  categoryFilter: Category | "all";
  setCategoryFilter: (category: Category | "all") => void;
  sizeFilter: "S" | "M" | "L" | "all";
  setSizeFilter: (size: "S" | "M" | "L" | "all") => void;
  isSpotlighted?: boolean;
  onFilterClick?: () => void; // Callback to close spotlight when filter is clicked
}

export function QuickFilters({
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
  sizeFilter,
  setSizeFilter,
  isSpotlighted = false,
  onFilterClick,
}: QuickFiltersProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Wrapper functions that close spotlight when clicked
  const handleFilterClick = (
    newFilter: "all" | "review" | "archive" | "starred"
  ) => {
    setFilter(newFilter);
    if (isSpotlighted && onFilterClick) {
      onFilterClick();
    }
  };

  const handleCategoryClick = (newCategory: Category | "all") => {
    setCategoryFilter(newCategory);
    if (isSpotlighted && onFilterClick) {
      onFilterClick();
    }
  };

  const handleSizeClick = (newSize: "S" | "M" | "L" | "all") => {
    setSizeFilter(newSize);
    if (isSpotlighted && onFilterClick) {
      onFilterClick();
    }
  };

  // Desktop Grid View (lg and up)
  const DesktopView = () => (
    <div className="hidden lg:block space-y-2">
      {/* View Filters - 4 column grid */}
      <div className="grid grid-cols-4 gap-2">
        {VIEW_FILTERS.map((viewFilter, index) => {
          const Icon = viewFilter.icon;
          const keys = ["Q", "W", "E", "R"];
          const isActive = filter === viewFilter.id;
          return (
            <Button
              key={viewFilter.id}
              onClick={() =>
                handleFilterClick(
                  viewFilter.id as "all" | "review" | "archive" | "starred"
                )
              }
              variant="unstyled"
              size="custom"
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? viewFilter.id === "all"
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-white"
                    : viewFilter.id === "starred"
                      ? "bg-amber-500/20 border border-amber-500/40 text-white"
                      : viewFilter.id === "review"
                        ? "bg-fuchsia-500/20 border border-fuchsia-500/40 text-white"
                        : "bg-slate-500/20 border border-slate-500/40 text-white"
                  : "bg-[#0d0e14]/30 border border-slate-700/10 text-slate-400 hover:bg-[#0d0e14]/50 hover:border-slate-600/20 hover:text-slate-300"
              }`}
            >
              {viewFilter.id !== "all" && (
                <Icon className="w-3 h-3 flex-shrink-0" />
              )}
              <div className="relative flex items-center min-w-0">
                <span className="truncate">{viewFilter.label}</span>
                {/* kbd positioned relative to container */}
                <kbd
                  className={`absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 text-[8px] font-mono whitespace-nowrap transition-opacity pointer-events-none ${
                    isSpotlighted ? "opacity-40" : "opacity-0"
                  }`}
                >
                  {keys[index]}
                </kbd>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Category Filters - 10 column grid */}
      <div className="grid grid-cols-10 gap-2">
        {categories.map((cat, index) => {
          const IconComponent =
            cat !== "all" ? getCategoryIcon(cat as Category) : null;
          const isActive = categoryFilter === cat;
          // Keyboard mapping: A, S, D, F, G, H, J, K, L, ;
          const keys = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"];
          const keyLabel = keys[index];

          return (
            <Button
              key={cat}
              onClick={() => handleCategoryClick(cat as Category | "all")}
              variant="unstyled"
              size="custom"
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? cat === "all"
                    ? "bg-slate-500/20 border border-slate-500/40 text-white"
                    : `${getCategoryColor(cat as Category)
                        .replace("bg-", "bg-")
                        .replace("/10", "/20")} border ${getCategoryColor(
                        cat as Category
                      )
                        .replace("bg-", "border-")
                        .replace("/10", "/40")} text-white`
                  : "bg-[#0d0e14]/30 border border-slate-700/10 text-slate-400 hover:bg-[#0d0e14]/50 hover:border-slate-600/20 hover:text-slate-300"
              }`}
            >
              {IconComponent && (
                <IconComponent className="w-3 h-3 flex-shrink-0" />
              )}
              <div className="relative flex items-center min-w-0">
                <span className="truncate">
                  {cat === "all"
                    ? FILTER_LABELS.CATEGORY_ALL
                    : getCategoryLabel(cat as Category)}
                </span>
                {/* kbd positioned relative to container */}
                <kbd
                  className={`absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 text-[8px] font-mono whitespace-nowrap transition-opacity pointer-events-none ${
                    isSpotlighted ? "opacity-40" : "opacity-0"
                  }`}
                >
                  {keyLabel}
                </kbd>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Size Filters - 4 column grid */}
      <div className="grid grid-cols-4 gap-2">
        {(["all", "S", "M", "L"] as const).map((size, index) => {
          const isActive = sizeFilter === size;
          const label =
            size === "all"
              ? FILTER_LABELS.SIZE_ALL
              : size === "S"
                ? FILTER_LABELS.SIZE_S
                : size === "M"
                  ? FILTER_LABELS.SIZE_M
                  : FILTER_LABELS.SIZE_L;
          const keys = ["Z", "X", "C", "V"];
          const keyLabel = keys[index];

          return (
            <Button
              key={size}
              onClick={() => handleSizeClick(size)}
              variant="unstyled"
              size="custom"
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-white"
                  : "bg-[#0d0e14]/30 border border-slate-700/10 text-slate-400 hover:bg-[#0d0e14]/50 hover:border-slate-600/20 hover:text-slate-300"
              }`}
            >
              <div className="relative flex items-center min-w-0">
                <span className="truncate">{label}</span>
                {/* kbd positioned relative to container */}
                <kbd
                  className={`absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 text-[8px] font-mono whitespace-nowrap transition-opacity pointer-events-none ${
                    isSpotlighted ? "opacity-40" : "opacity-0"
                  }`}
                >
                  {keyLabel}
                </kbd>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );

  // iOS-style Badge for Mobile/Tablet
  const IOSBadge = ({
    icon: Icon,
    label,
    isActive,
    onClick,
    colors,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
    colors?: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all min-w-[70px] ${
        isActive
          ? "bg-gradient-to-br backdrop-blur-xl shadow-lg scale-105"
          : "bg-gradient-to-br backdrop-blur-xl opacity-60 hover:opacity-80"
      } ${colors || "from-slate-500/30 via-slate-400/20 to-slate-500/30"}`}
      style={{
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? "bg-white/20" : "bg-white/10"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${isActive ? "text-white" : "text-white/70"}`}
        />
      </div>
      <span
        className={`text-[10px] font-medium ${isActive ? "text-white" : "text-white/70"}`}
      >
        {label}
      </span>
    </button>
  );

  // Mobile/Tablet Carousel View
  const MobileView = () => {
    // Use metadata for consistency
    const categoryFilters = CATEGORY_ORDER.map((cat) => CATEGORY_FILTERS[cat]);

    return (
      <div className="lg:hidden space-y-4">
        {/* View Filters Carousel */}
        <div>
          <h3 className="text-xs text-slate-500 mb-2 px-1">Views</h3>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 pb-2">
              {VIEW_FILTERS.map((item) => (
                <IOSBadge
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={filter === item.id}
                  onClick={() =>
                    handleFilterClick(
                      item.id as "all" | "review" | "archive" | "starred"
                    )
                  }
                  colors={item.colors}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Category Filters Carousel */}
        <div>
          <h3 className="text-xs text-slate-500 mb-2 px-1">Types</h3>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 pb-2">
              {categoryFilters.map((item) => (
                <IOSBadge
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={categoryFilter === item.id}
                  onClick={() => setCategoryFilter(item.id as Category | "all")}
                  colors={item.colors}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Size Filters Carousel */}
        <div>
          <h3 className="text-xs text-slate-500 mb-2 px-1">Sizes</h3>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 pb-2">
              {SIZE_FILTERS.map((item) => (
                <IOSBadge
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={sizeFilter === item.id}
                  onClick={() =>
                    handleSizeClick(item.id as "S" | "M" | "L" | "all")
                  }
                  colors={item.colors}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        style={
          isSpotlighted
            ? {
                boxShadow:
                  "0 0 60px 20px rgba(79, 70, 229, 0.25), 0 0 120px 40px rgba(79, 70, 229, 0.12), 0 0 180px 60px rgba(79, 70, 229, 0.06)",
                borderRadius: "12px",
                backgroundColor: "rgba(79, 70, 229, 0.30)",
              }
            : undefined
        }
      >
        <DesktopView />
        <MobileView />
      </div>

      {/* Explanation box - Absolute popup below filters */}
      {isSpotlighted && (
        <div className="absolute left-0 right-0 mt-6 z-50">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs text-indigo-300 mb-2 font-medium">
              Press a key to filter:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
              <div>
                <span className="text-indigo-400 font-mono">Q/W/E/R</span> Views
              </div>
              <div>
                <span className="text-indigo-400 font-mono">A/S/D/F...</span>{" "}
                Types
              </div>
              <div>
                <span className="text-indigo-400 font-mono">Z/X/C/V</span> Sizes
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[9px]">
                ⌥F
              </kbd>{" "}
              to toggle spotlight •{" "}
              <kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[9px]">
                Esc
              </kbd>{" "}
              to cancel
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
