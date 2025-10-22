"use client";

import { LogOut } from "lucide-react";
import { KoetoriExplanation } from "../KoetoriExplanation";
import { ActionButtons } from "./ActionButtons";

interface AppHeaderProps {
  onRandomMemo: () => void;
  onSearch: () => void;
  onTextInput: () => void;
  onRecordStart: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  isProcessingText: boolean;
}

export function AppHeader({
  onRandomMemo,
  onSearch,
  onTextInput,
  onRecordStart,
  onRecordStop,
  isRecording,
  isProcessing,
  isProcessingText,
}: AppHeaderProps) {
  const handleSignOut = () => {
    localStorage.removeItem("koetori_username");
    window.location.reload();
  };

  return (
    <header className="mb-8">
      {/* Top Bar: Branding + Profile */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1
            onClick={onRandomMemo}
            className="text-2xl sm:text-3xl md:text-4xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity select-none"
            role="button"
            tabIndex={0}
            aria-label="Click for random memo"
          >
            <KoetoriExplanation>
              <span>koetori</span>
            </KoetoriExplanation>
          </h1>
          <button
            onClick={handleSignOut}
            className="text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm border border-slate-700/20"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <ActionButtons
          onSearch={onSearch}
          onTextInput={onTextInput}
          onRecordStart={onRecordStart}
          onRecordStop={onRecordStop}
          isRecording={isRecording}
          isProcessing={isProcessing}
          isProcessingText={isProcessingText}
        />
      </div>
    </header>
  );
}
