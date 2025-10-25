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
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Search button */}
      <ActionButton
        onClick={() => setShowSearch(true)}
        icon={Search}
        label="Search"
        shortcut="⌥K"
        variant="secondary"
      />

      {/* Type button */}
      <ActionButton
        onClick={() => setShowTextInput(true)}
        icon={Type}
        label="Type"
        shortcut="⌥T"
        variant="secondary"
      />

      {/* Random button */}
      <ActionButton
        onClick={() => onPickRandomMemo()}
        icon={Shuffle}
        label="Random"
        shortcut="⌥J"
        variant="secondary"
      />

      {/* Record button */}
      <ActionButton
        onClick={onRecordClick}
        icon={Mic}
        label={isRecording ? "Recording..." : "Record"}
        shortcut="Space"
        disabled={isProcessing}
        variant="primary"
        className="shadow-lg shadow-indigo-500/20"
      />

      {/* Settings button - icon only on desktop, icon only on all breakpoints */}
      <ActionButton
        onClick={() => setShowSettings(true)}
        icon={Settings}
        label="Settings"
        variant="secondary"
        iconOnly
      />
    </div>
  );
}
