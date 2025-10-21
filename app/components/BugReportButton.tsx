"use client";

import { Bug } from "lucide-react";

interface BugReportButtonProps {
  onClick: () => void;
}

export function BugReportButton({ onClick }: BugReportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-amber-400 hover:text-amber-300 transition-all duration-200 text-xs font-medium backdrop-blur-sm"
      aria-label="Report a bug"
    >
      <Bug className="w-3.5 h-3.5 group-hover:rotate-[20deg] transition-transform duration-200" />
      <span className="hidden sm:inline">Found any bugs?</span>
      <span className="sm:hidden">Bug?</span>
    </button>
  );
}
