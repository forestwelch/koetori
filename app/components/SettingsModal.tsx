"use client";

import { Bug, LogOut, Github, X, Archive } from "lucide-react";
import { Button } from "./ui/Button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShowFeedback: (show: boolean) => void;
  onOpenArchive: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  setShowFeedback,
  onOpenArchive,
}: SettingsModalProps) {
  const handleLogout = () => {
    localStorage.removeItem("koetori_username");
    window.location.reload();
  };

  const handleBugReport = () => {
    onClose();
    setShowFeedback(true);
  };

  const handleGithub = () => {
    window.open("https://github.com/forestwelch", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-[#0a0b0f]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700/30 transition-colors text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {/* Archived Memos */}
          <Button
            onClick={() => {
              onClose();
              onOpenArchive();
            }}
            variant="unstyled"
            size="custom"
            aria-label="View archived memos"
            className="w-full flex items-center gap-3 text-slate-300 hover:text-white transition-all p-4 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 backdrop-blur-sm group border border-slate-700/30"
          >
            <Archive className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium">Archived memos</span>
          </Button>

          {/* Bug Report Button */}
          <Button
            onClick={handleBugReport}
            variant="unstyled"
            size="custom"
            aria-label="Report a bug"
            className="w-full flex items-center gap-3 text-amber-500 hover:text-amber-300 transition-all p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-sm group border border-amber-500/20"
          >
            <Bug className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium">Report a Bug</span>
          </Button>

          {/* GitHub Link */}
          <Button
            onClick={handleGithub}
            variant="unstyled"
            size="custom"
            aria-label="View GitHub profile"
            className="w-full flex items-center gap-3 text-slate-300 hover:text-white transition-all p-4 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 backdrop-blur-sm group border border-slate-700/30"
          >
            <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium">GitHub</span>
          </Button>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="unstyled"
            size="custom"
            aria-label="Sign out"
            className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 transition-all p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm group border border-red-500/20"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
