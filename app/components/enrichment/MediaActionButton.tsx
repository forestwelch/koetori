"use client";

import { LucideIcon, Loader2 } from "lucide-react";
import Link from "next/link";

interface MediaActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "default" | "danger" | "primary";
}

export function MediaActionButton({
  icon: Icon,
  label,
  onClick,
  href,
  disabled = false,
  isLoading = false,
  variant = "default",
}: MediaActionButtonProps) {
  const baseClasses =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-60";

  const variantClasses = {
    default:
      "border-slate-700/40 bg-[#101525]/70 text-slate-300 hover:border-indigo-500/40 hover:text-white",
    danger:
      "border-rose-600/40 bg-rose-600/20 text-rose-100 hover:border-rose-400/40 hover:text-white",
    primary:
      "border-indigo-500/40 bg-indigo-500/20 text-indigo-200 hover:border-indigo-500/60 hover:text-white",
  };

  const className = `${baseClasses} ${variantClasses[variant]}`;

  if (typeof href === "string" && href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} cursor-pointer`}
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
      </a>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} cursor-pointer`}
        prefetch={false}
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={label}
      className={`${className} cursor-pointer`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </button>
  );
}
