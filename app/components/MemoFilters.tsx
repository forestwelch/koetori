import { Star } from "lucide-react";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../lib/ui-utils";
import { Category } from "../types/memo";
import { categories, FILTER_LABELS } from "../lib/constants";
import { Button } from "./ui/Button";

interface MemoFiltersProps {
  filter: "all" | "review" | "archive" | "starred";
  setFilter: (filter: "all" | "review" | "archive" | "starred") => void;
  categoryFilter: Category | "all";
  setCategoryFilter: (category: Category | "all") => void;
  openDropdown: "view" | "category" | null;
  setOpenDropdown: (dropdown: "view" | "category" | null) => void;
}

export default function MemoFilters({
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
  openDropdown,
  setOpenDropdown,
}: MemoFiltersProps) {
  return (
    <div className="hidden md:flex gap-2 flex-wrap items-center justify-start">
      {/* Main View Filter */}
      <div className="relative group">
        <Button
          onClick={() =>
            setOpenDropdown(openDropdown === "view" ? null : "view")
          }
          variant="unstyled"
          size="custom"
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#0d0e14]/40 border border-slate-700/20 text-[#cbd5e1] hover:bg-[#0d0e14]/60 transition-all backdrop-blur-xl whitespace-nowrap min-w-[4rem]"
        >
          {filter === "all"
            ? FILTER_LABELS.VIEW_ALL
            : filter === "starred"
              ? FILTER_LABELS.VIEW_STARRED
              : filter === "review"
                ? FILTER_LABELS.VIEW_REVIEW
                : filter === "archive"
                  ? FILTER_LABELS.VIEW_ARCHIVE
                  : FILTER_LABELS.VIEW_ALL}{" "}
          ▾
        </Button>

        {/* Dropdown - hover on desktop, click on mobile */}
        <div
          className={`absolute top-full left-0 mt-1 w-40 bg-[#0d0e14]/98 backdrop-blur-xl border border-slate-700/40 rounded-lg shadow-2xl overflow-hidden transition-all z-50 ${
            openDropdown === "view"
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          } sm:group-hover:opacity-100 sm:group-hover:visible`}
        >
          <Button
            onClick={() => {
              setFilter("all");
              setOpenDropdown(null);
            }}
            variant="unstyled"
            size="custom"
            className={`w-full px-3 py-2 text-sm text-left justify-start transition-colors ${
              filter === "all"
                ? "bg-indigo-500/30 text-white"
                : "text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            {FILTER_LABELS.VIEW_ALL}
          </Button>
          <Button
            onClick={() => {
              setFilter("starred");
              setOpenDropdown(null);
            }}
            variant="unstyled"
            size="custom"
            className={`w-full px-3 py-2 text-sm text-left justify-start transition-colors flex items-center gap-2 ${
              filter === "starred"
                ? "bg-amber-500/30 text-white"
                : "text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            <Star className="w-3.5 h-3.5" /> {FILTER_LABELS.VIEW_STARRED}
          </Button>
          <Button
            onClick={() => {
              setFilter("review");
              setOpenDropdown(null);
            }}
            variant="unstyled"
            size="custom"
            className={`w-full px-3 py-2 text-sm text-left justify-start transition-colors ${
              filter === "review"
                ? "bg-fuchsia-500/30 text-white"
                : "text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            {FILTER_LABELS.VIEW_REVIEW}
          </Button>
          <Button
            onClick={() => {
              setFilter("archive");
              setOpenDropdown(null);
            }}
            variant="unstyled"
            size="custom"
            className={`w-full px-3 py-2 text-sm text-left justify-start transition-colors ${
              filter === "archive"
                ? "bg-slate-500/30 text-white"
                : "text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            {FILTER_LABELS.VIEW_ARCHIVE}
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="relative group">
        <Button
          onClick={() =>
            setOpenDropdown(openDropdown === "category" ? null : "category")
          }
          variant="unstyled"
          size="custom"
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#0d0e14]/40 border border-slate-700/20 text-[#cbd5e1] hover:bg-[#0d0e14]/60 transition-all backdrop-blur-xl whitespace-nowrap min-w-[4rem]"
        >
          {categoryFilter === "all" ? "Type" : getCategoryLabel(categoryFilter)}{" "}
          ▾
        </Button>

        {/* Dropdown - hover on desktop, click on mobile */}
        <div
          className={`absolute top-full left-0 mt-1 w-48 bg-[#0d0e14]/98 backdrop-blur-xl border border-slate-700/40 rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto transition-all z-50 ${
            openDropdown === "category"
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          } sm:group-hover:opacity-100 sm:group-hover:visible`}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setOpenDropdown(null);
              }}
              variant="unstyled"
              size="custom"
              className={`w-full px-3 py-2 text-sm text-left justify-start transition-colors ${
                categoryFilter === cat
                  ? cat === "all"
                    ? "bg-slate-500/30 text-white"
                    : `${getCategoryColor(cat as Category).split(" ")[0]} text-white`
                  : "text-slate-300 hover:bg-slate-700/30"
              }`}
            >
              {cat === "all" ? (
                FILTER_LABELS.CATEGORY_ALL
              ) : (
                <>
                  {(() => {
                    const IconComponent = getCategoryIcon(cat as Category);
                    return <IconComponent className="w-3 h-3 inline mr-2" />;
                  })()}
                  {getCategoryLabel(cat as Category)}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
