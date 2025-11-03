"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/ui-utils";

interface SidebarNavItemProps {
  href?: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  isActive?: boolean;
  isCollapsed?: boolean;
  showExpandedContent?: boolean;
  variant?: "desktop" | "mobile";
}

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  onClick,
  isActive = false,
  isCollapsed = false,
  showExpandedContent = true,
  variant = "desktop",
}: SidebarNavItemProps) {
  const baseClassName =
    variant === "desktop"
      ? cn(
          "w-full flex items-center rounded-lg text-sm font-medium transition-colors group relative overflow-hidden cursor-pointer",
          isActive
            ? "bg-indigo-500/20 text-indigo-300"
            : "text-slate-400 hover:text-white hover:bg-slate-800/50",
          "gap-[13px] px-3 py-2"
        )
      : cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer",
          isActive
            ? "bg-indigo-500/20 text-indigo-300"
            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
        );

  const iconClassName =
    variant === "desktop"
      ? "w-[18px] h-[18px] flex-shrink-0"
      : "w-5 h-5 flex-shrink-0";

  const textStyle =
    variant === "desktop"
      ? {
          clipPath: showExpandedContent ? "inset(0)" : "inset(0 100% 0 0)",
          transition: "clip-path 300ms ease-in-out",
          width: showExpandedContent ? "auto" : "0",
          overflow: "hidden" as const,
        }
      : undefined;

  if (onClick && !href) {
    // Render as button (e.g., Random memo)
    return (
      <button
        onClick={onClick}
        className={baseClassName}
        title={isCollapsed || !showExpandedContent ? label : undefined}
      >
        <Icon className={iconClassName} />
        {variant === "desktop" ? (
          <span className="whitespace-nowrap" style={textStyle}>
            {label}
          </span>
        ) : (
          <span>{label}</span>
        )}
      </button>
    );
  }

  // Render as Link (navigation items)
  return (
    <Link
      href={href || "#"}
      className={baseClassName}
      title={isCollapsed || !showExpandedContent ? label : undefined}
      onClick={onClick}
    >
      <Icon className={iconClassName} />
      {variant === "desktop" ? (
        <span className="whitespace-nowrap" style={textStyle}>
          {label}
        </span>
      ) : (
        <span>{label}</span>
      )}
    </Link>
  );
}
