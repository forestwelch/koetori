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
      e.stopPropagation();
      onSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Text Memo"
      size="xl"
    >
      <div className="h-full flex flex-col min-h-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your memo text here..."
          className="w-full flex-1 min-h-[300px] sm:min-h-[400px] bg-[#1e1f2a]/60 border border-slate-700/30 rounded-xl p-6 text-base sm:text-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/30 transition-all leading-relaxed"
          onKeyDown={handleKeyDown}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4 pb-safe flex-shrink-0">
          <p className="text-slate-400 text-sm hidden sm:block">
            Press{" "}
            <kbd className="px-2 py-1 bg-slate-700/50 rounded-md text-xs font-mono border border-slate-600/50">
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
