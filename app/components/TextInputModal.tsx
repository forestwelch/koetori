"use client";

import { useRef, useEffect } from "react";

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="w-full h-full sm:w-full sm:max-w-2xl sm:h-auto bg-[#0d0e14] sm:bg-[#0d0e14]/98 backdrop-blur-xl sm:border sm:border-slate-700/40 sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Add Text Memo</h2>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/20 hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your memo text here..."
            className="w-full flex-1 sm:h-40 bg-[#1e1f2a]/60 border border-slate-700/30 rounded-lg p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-slate-400 text-sm">
              <span className="hidden sm:inline">
                Press{" "}
                <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                  Cmd+Enter
                </kbd>{" "}
                to save
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSubmit}
                disabled={!value.trim() || isProcessing}
                className={`w-full sm:w-auto px-6 py-3 sm:px-6 sm:py-2 rounded-lg font-medium transition-all ${
                  !value.trim() || isProcessing
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg"
                }`}
              >
                {isProcessing ? "Saving..." : "Save Memo"}
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
