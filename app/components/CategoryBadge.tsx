"use client";

import { Category } from "../types/memo";
import {
  getCategoryIcon,
  getCategoryBadgeCompact,
  getCategoryLabel,
} from "../lib/ui-utils";

interface CategoryBadgeProps {
  category: Category;
  mode?: "compact" | "expanded"; // Keep for backwards compatibility
  showLabel?: boolean; // Keep for backwards compatibility
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const IconComponent = getCategoryIcon(category);
  // Always use compact styling since we only want icons
  const badgeClasses = getCategoryBadgeCompact(category);
  const combinedClasses = className
    ? `${badgeClasses} ${className}`
    : badgeClasses;

  return (
    <span className={combinedClasses} title={getCategoryLabel(category)}>
      <IconComponent className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{getCategoryLabel(category)}</span>
    </span>
  );
}
