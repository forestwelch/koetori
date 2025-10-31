"use client";
import { cn } from "../lib/ui-utils";

const SIZE_OPTIONS = ["all", "S", "M", "L"] as const;
type SizeOption = (typeof SIZE_OPTIONS)[number];

const sizeLabels: Record<SizeOption, string> = {
  all: "All",
  S: "Small",
  M: "Medium",
  L: "Large",
};

interface SizeFilterShowcaseProps {
  sizeFilter: SizeOption;
  setSizeFilter: (size: SizeOption) => void;
}

export function SizeFilterShowcase({
  sizeFilter,
  setSizeFilter,
}: SizeFilterShowcaseProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/40 bg-[#0b0d16]/80 px-1.5 py-1 text-[11px] font-medium shadow-sm">
      {SIZE_OPTIONS.map((option) => {
        const isActive = option === sizeFilter;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setSizeFilter(option)}
            className={cn(
              "rounded-full px-2 py-1 transition-colors",
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-[0_1px_6px_rgba(99,102,241,0.35)]"
                : "text-[#94a3b8] hover:text-slate-200"
            )}
          >
            {sizeLabels[option]}
          </button>
        );
      })}
    </div>
  );
}
