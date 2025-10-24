"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Command } from "lucide-react";
import { Category } from "../types/memo";
import {
  VIEW_FILTERS,
  CATEGORY_FILTERS,
  SIZE_FILTERS,
  CATEGORY_ORDER,
} from "../lib/filterMetadata";

interface FilterOption {
  id: string;
  label: string;
  searchTerms: string[];
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  action: () => void;
  type: "view" | "category" | "size";
}

interface FilterCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setFilter: (filter: "all" | "review" | "archive" | "starred") => void;
  setCategoryFilter: (category: Category | "all") => void;
  setSizeFilter: (size: "S" | "M" | "L" | "all") => void;
}

export function FilterCommandPalette({
  isOpen,
  onClose,
  setFilter,
  setCategoryFilter,
  setSizeFilter,
}: FilterCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build filter options using the metadata
  const filterOptions: FilterOption[] = [
    // View filters
    ...VIEW_FILTERS.map((filter) => ({
      id: `view-${filter.id}`,
      label: filter.label,
      searchTerms: filter.searchTerms,
      icon: filter.icon,
      colors: filter.colors,
      type: "view" as const,
      action: () =>
        setFilter(filter.id as "all" | "review" | "archive" | "starred"),
    })),
    // Category filters
    ...CATEGORY_ORDER.map((cat) => {
      const metadata = CATEGORY_FILTERS[cat];
      return {
        id: `category-${cat}`,
        label: metadata.label,
        searchTerms: metadata.searchTerms,
        icon: metadata.icon,
        colors: metadata.colors,
        type: "category" as const,
        action: () => setCategoryFilter(cat as Category | "all"),
      };
    }),
    // Size filters
    ...SIZE_FILTERS.map((filter) => ({
      id: `size-${filter.id}`,
      label: filter.label,
      searchTerms: filter.searchTerms,
      icon: filter.icon,
      colors: filter.colors,
      type: "size" as const,
      action: () => setSizeFilter(filter.id as "S" | "M" | "L" | "all"),
    })),
  ];

  // Filter options based on query - partial matching
  const filteredOptions = query.trim()
    ? filterOptions.filter((option) =>
        option.searchTerms.some((term) =>
          term.toLowerCase().includes(query.toLowerCase())
        )
      )
    : filterOptions;

  // Close handler
  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow Down - next option
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
      // Arrow Up - previous option
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
      // Enter - confirm selection
      else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          filteredOptions[selectedIndex].action();
          handleClose();
        }
      }
      // Escape - close
      else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
      // Tab - next option (like arrow down)
      else if (e.key === "Tab") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredOptions, selectedIndex, handleClose]);

  // Reset selected index when filtered options change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-palette-title"
    >
      {/* Dark overlay with backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Command Palette */}
      <div
        className="relative w-full max-w-2xl bg-[#0a0b0f]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Command className="w-5 h-5" />
            <span className="text-sm font-medium">Quick Filter</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-slate-700/30 transition-colors text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative px-4 py-4 border-b border-slate-700/50">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a few letters... (e.g., 'star', 'med', 'long')"
            className="w-full bg-transparent text-white text-lg placeholder:text-slate-500 focus:outline-none"
            aria-label="Filter search"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Options List */}
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              No filters found
            </div>
          ) : (
            <div className="py-2">
              {filteredOptions.map((option, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = option.icon;

                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.action();
                      handleClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-indigo-500/20 border-l-2 border-indigo-400"
                        : "hover:bg-slate-700/20 border-l-2 border-transparent"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br backdrop-blur-xl ${option.colors}`}
                      style={{
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      }}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${
                          isSelected ? "text-white" : "text-white/80"
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {option.label}
                      </span>
                      <div className="text-xs text-slate-500 capitalize">
                        {option.type}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-xs text-indigo-400">
                        <kbd className="px-1.5 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/30 text-[10px]">
                          ↵
                        </kbd>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="border-t border-slate-700/50 px-4 py-2 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded border border-slate-700/50 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded border border-slate-700/50 text-[10px]">
              ↵
            </kbd>
            <span>Confirm</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded border border-slate-700/50 text-[10px]">
              Esc
            </kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
