"use client";

import { Bug, LogOut, Github } from "lucide-react";
import { Button } from "./ui/Button";

interface MobileFooterProps {
  setShowFeedback: (show: boolean) => void;
}

export function MobileFooter({ setShowFeedback }: MobileFooterProps) {
  const handleLogout = () => {
    localStorage.removeItem("koetori_username");
    window.location.reload();
  };

  return (
    // Desktop: Fixed bottom-right compact buttons
    <div className="hidden lg:block fixed bottom-6 right-6 z-30">
      <div className="flex flex-col gap-2">
        {/* Bug Report Button - Compact */}
        <Button
          onClick={() => setShowFeedback(true)}
          variant="unstyled"
          size="custom"
          aria-label="Report a bug"
          title="Report a bug"
          className="w-10 h-10 flex items-center justify-center text-amber-500 hover:text-amber-300 transition-all rounded-lg bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-sm group border border-amber-500/20"
        >
          <Bug className="w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
        </Button>

        {/* GitHub Link - Compact */}
        <Button
          onClick={() =>
            window.open("https://github.com/forestwelch", "_blank")
          }
          variant="unstyled"
          size="custom"
          aria-label="View GitHub profile"
          title="GitHub"
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all rounded-lg bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm group"
        >
          <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        </Button>

        {/* Logout Button - Compact */}
        <Button
          onClick={handleLogout}
          variant="unstyled"
          size="custom"
          aria-label="Sign out"
          title="Sign out"
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all rounded-lg bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 group-hover:-translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}
