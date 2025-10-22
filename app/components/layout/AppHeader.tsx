"use client";

import { LogOut, Search, Type } from "lucide-react";
import { BugReportButton } from "../BugReportButton";
import { ActionButton } from "../ActionButton";
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1
            onClick={onRandomMemo}
            className="text-2xl sm:text-3xl md:text-4xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
          >
            koetori
          </h1>
          <BugReportButton onClick={() => setShowFeedback(true)} />
          <button
            onClick={() => {
              localStorage.removeItem("koetori_username");
              window.location.reload();
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 sm:p-2 rounded-lg bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Text Input and Record Buttons */}
          <div className="flex items-center gap-2 sm:gap-3"></div>
          {/* Text Input Status */}
          {isProcessingText && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Processing...</span>
            </div>
          )}

          {/* Recording/Processing Status */}
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

          {/* Search Button */}
          <ActionButton
            onClick={onSearch}
            disabled={isProcessing || isProcessingText}
            icon={<Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            ariaLabel="Search memos"
            title="Search memos"
            gradient="bg-gradient-to-br from-orange-500 to-pink-500"
            shadowColor="shadow-orange-500/50 hover:shadow-orange-500/70"
            glowColor="bg-gradient-to-br from-orange-400 to-pink-400"
          />

          {/* Text Input Button */}
          <ActionButton
            onClick={onTextInput}
            disabled={isProcessing || isProcessingText}
            icon={<Type className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            ariaLabel="Add text memo"
            title="Add text memo"
            gradient="bg-gradient-to-br from-emerald-500 to-cyan-500"
            shadowColor="shadow-emerald-500/50 hover:shadow-emerald-500/70"
            glowColor="bg-gradient-to-br from-emerald-400 to-cyan-400"
          />

          {/* Voice Record Button */}
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
            icon={
              isRecording ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm" />
              ) : (
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )
            }
          />
        </div>
      </div>

      {/* Recording Error */}
      {voiceError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{voiceError}</p>
        </div>
      )}
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
    </header>
  );
}
