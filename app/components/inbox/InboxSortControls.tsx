"use client";

import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/ui-utils";

export type SortField = "timestamp" | "confidence" | "starred";
export type SortDirection = "asc" | "desc";

export interface InboxSortControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

const sortFieldConfig: Record<
  SortField,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  timestamp: { label: "Date", icon: Clock },
  confidence: { label: "Confidence", icon: TrendingUp },
  starred: { label: "Starred", icon: Star },
};

export function InboxSortControls({
  sortField,
  sortDirection,
  onSortChange,
}: InboxSortControlsProps) {
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      onSortChange(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      onSortChange(field, "desc");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 mr-1">Sort by:</span>
      {Object.entries(sortFieldConfig).map(([field, config]) => {
        const Icon = config.icon;
        const isActive = sortField === field;

        return (
          <Button
            key={field}
            variant="ghost"
            size="sm"
            onClick={() => handleSortClick(field as SortField)}
            className={cn(
              "text-xs h-7",
              isActive
                ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-300"
            )}
          >
            <Icon className="w-3 h-3 mr-1.5" />
            {config.label}
            {isActive &&
              (sortDirection === "asc" ? (
                <ArrowUp className="w-3 h-3 ml-1" />
              ) : (
                <ArrowDown className="w-3 h-3 ml-1" />
              ))}
          </Button>
        );
      })}
    </div>
  );
}
