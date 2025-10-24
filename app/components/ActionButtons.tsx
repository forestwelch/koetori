"use client";

import { Mic, Search, Type, Shuffle, Settings } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useModals } from "../contexts/ModalContext";

interface ActionButtonsProps {
  onRecordClick: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  onPickRandomMemo: () => void;
}

export function ActionButtons({
  onRecordClick,
  isRecording,
  isProcessing,
  onPickRandomMemo,
}: ActionButtonsProps) {
  const { setShowSearch, setShowTextInput, setShowSettings } = useModals();

  return (
    <>
      {/* Desktop Action Buttons */}
      <div className="hidden lg:flex items-center gap-3">
        <ActionButton
          onClick={() => setShowSearch(true)}
          icon={Search}
          label="Search"
          shortcut="⌘K"
          variant="secondary"
        />
        <ActionButton
          onClick={() => setShowTextInput(true)}
          icon={Type}
          label="Type"
          shortcut="⌘E"
          variant="secondary"
        />
        <ActionButton
          onClick={onPickRandomMemo}
          icon={Shuffle}
          label="Random"
          shortcut="⌘J"
          variant="secondary"
        />
        <button
          onClick={() => setShowSettings(true)}
          className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
        <ActionButton
          onClick={onRecordClick}
          icon={Mic}
          label={isRecording ? "Recording..." : "Record"}
          shortcut="Space"
          disabled={isProcessing}
          variant="primary"
          className="shadow-lg shadow-indigo-500/20"
        />
      </div>

      {/* Mobile Action Buttons */}
      <div className="flex lg:hidden items-center gap-2">
        <ActionButton
          onClick={() => setShowSearch(true)}
          icon={Search}
          label="Search"
          variant="secondary"
          size="sm"
        />
        <ActionButton
          onClick={() => setShowTextInput(true)}
          icon={Type}
          label="Type"
          variant="secondary"
          size="sm"
        />
        <ActionButton
          onClick={onRecordClick}
          icon={Mic}
          label="Record"
          disabled={isProcessing}
          variant="primary"
          size="sm"
        />
        {/* Settings icon-only on tablet and mobile */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>
    </>
  );
}
