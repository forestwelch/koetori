"use client";

import { Bug, LogOut, Github } from "lucide-react";
import { Button } from "./ui/Button";
import { BaseModal } from "./ui/BaseModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShowFeedback: (show: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  setShowFeedback,
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="sm"
      fullHeightOnMobile={false}
      className="bg-[#0a0b0f]/95 backdrop-blur-xl"
    >
      <div className="p-6 space-y-3">
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
    </BaseModal>
  );
}
