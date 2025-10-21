"use client";

import { Category } from "../types/memo";
import { getCategoryIcon, getCategoryBadgeCompact } from "../lib/ui-utils";

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
    <div className={combinedClasses}>
      <IconComponent className="w-3 h-3 flex-shrink-0" />
    </div>
  );
}
