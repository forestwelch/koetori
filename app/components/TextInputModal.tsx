"use client";

import { useRef, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

interface TextInputModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export function TextInputModal({
  isOpen,
  value,
  onChange,
  onClose,
  onSubmit,
  isProcessing,
}: TextInputModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    onChange("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Text Memo"
      size="lg"
    >
      <div className="h-full flex flex-col">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your memo text here..."
          className="w-full flex-1 min-h-[60vh] sm:min-h-0 sm:h-40 bg-[#1e1f2a]/60 border border-slate-700/30 rounded-lg p-4 text-base sm:text-sm text-white placeholder-slate-400 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
          onKeyDown={handleKeyDown}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 pb-safe">
          <p className="text-slate-400 text-sm hidden sm:block">
            Press{" "}
            <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs">
              Cmd+Enter
            </kbd>{" "}
            to save
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={onSubmit}
              disabled={!value.trim() || isProcessing}
              variant="success"
              size="lg"
              isLoading={isProcessing}
              className="w-full sm:w-auto touch-manipulation"
            >
              {isProcessing ? "Saving..." : "Save Memo"}
            </Button>
            <Button
              onClick={handleClose}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto touch-manipulation"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
