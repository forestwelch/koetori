"use client";

import { Bug } from "lucide-react";

interface BugReportButtonProps {
  onClick: () => void;
}

export function BugReportButton({ onClick }: BugReportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-amber-500 hover:text-amber-300 transition-colors p-1.5 sm:p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-sm"
      aria-label="Report a bug"
      title="Report a bug"
    >
      <Bug className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-[20deg] transition-transform duration-200" />
    </button>
  );
}
