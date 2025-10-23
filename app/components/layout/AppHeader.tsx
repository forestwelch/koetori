"use client";

import { LogOut, Mic, Search, Type, Bug } from "lucide-react";
import { ActionButton } from "../ActionButton";
import { Button } from "../ui/Button";
import MemoFilters from "../MemoFilters";
import { Category } from "../../types/memo";

interface AppHeaderProps {
  onRandomMemo: () => void;
  onSearch: () => void;
  onTextInput: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  isProcessingText: boolean;
  setShowFeedback: (show: boolean) => void;
  handleRecordClick: () => void;
  voiceError?: string | null;
  filter: "all" | "review" | "archive" | "starred";
  setFilter: (filter: "all" | "review" | "archive" | "starred") => void;
  categoryFilter: Category | "all";
  setCategoryFilter: (category: Category | "all") => void;
  sizeFilter: "S" | "M" | "L" | "all";
  setSizeFilter: (size: "S" | "M" | "L" | "all") => void;
  openDropdown: "view" | "category" | "size" | null;
  setOpenDropdown: (dropdown: "view" | "category" | "size" | null) => void;
}

export function AppHeader({
  onRandomMemo,
  onSearch,
  onTextInput,
  isRecording,
  isProcessing,
  isProcessingText,
  setShowFeedback,
  handleRecordClick,
  voiceError,
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
  sizeFilter,
  setSizeFilter,
  openDropdown,
  setOpenDropdown,
}: AppHeaderProps) {
  return (
    <header className="mb-8">
      <div className="space-y-4">
        {/* First row: Title and action buttons */}
        <div className="flex items-center justify-between">
          <h1
            onClick={onRandomMemo}
            className="text-4xl sm:text-5xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
          >
            koetori
          </h1>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-3">
            {/* Status indicators */}
            {isProcessingText && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="hidden sm:inline">Recording...</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
              </div>
            )}

            {/* Action buttons */}
            <ActionButton
              onClick={onSearch}
              disabled={isProcessing || isProcessingText}
              icon={<Search className="w-6 h-6 text-white" />}
              ariaLabel="Search memos"
              title="Search memos"
              gradient="bg-gradient-to-br from-orange-500 to-pink-500"
              shadowColor="shadow-orange-500/50 hover:shadow-orange-500/70"
              glowColor="bg-gradient-to-br from-orange-400 to-pink-400"
            />

            <ActionButton
              onClick={onTextInput}
              disabled={isProcessing || isProcessingText}
              icon={<Type className="w-6 h-6 text-white" />}
              ariaLabel="Add text memo"
              title="Add text memo"
              gradient="bg-gradient-to-br from-emerald-500 to-cyan-500"
              shadowColor="shadow-emerald-500/50 hover:shadow-emerald-500/70"
              glowColor="bg-gradient-to-br from-emerald-400 to-cyan-400"
            />

            <ActionButton
              onClick={handleRecordClick}
              disabled={isProcessing || isProcessingText}
              ariaLabel={isRecording ? "Stop recording" : "Start recording"}
              title={isRecording ? "Stop recording" : "Start recording"}
              gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
              shadowColor="shadow-indigo-500/50 hover:shadow-indigo-500/70"
              glowColor="bg-gradient-to-br from-indigo-400 to-purple-400"
              isActive={isRecording}
              activeColor="bg-red-500 shadow-red-500/50 hover:shadow-red-500/70"
              icon={<Mic className="w-6 h-6 text-white" />}
            />
          </div>
        </div>

        {/* Second row: Filters and utility buttons */}
        <div className="flex items-center justify-between">
          <MemoFilters
            filter={filter}
            setFilter={setFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sizeFilter={sizeFilter}
            setSizeFilter={setSizeFilter}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFeedback(true)}
              variant="unstyled"
              size="custom"
              aria-label="Report a bug"
              className="text-amber-500 hover:text-amber-300 transition-colors p-1.5 sm:p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-sm"
            >
              <Bug className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-[20deg] transition-transform duration-200" />
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem("koetori_username");
                window.location.reload();
              }}
              variant="unstyled"
              size="custom"
              aria-label="Sign out"
              className="text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recording Error */}
      {voiceError && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{voiceError}</p>
        </div>
      )}
    </header>
  );
}
