"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { Popover } from "react-aria-components";

export type EditType = "category" | "summary" | "size" | "transcript" | "tags";

interface EditFeedbackDialogProps {
  isOpen: boolean;
  editType: EditType;
  originalValue: string | null;
  newValue: string | null;
  targetElement?: HTMLElement | null;
  onSkip: () => void;
  onSubmit: (feedbackText: string) => Promise<void>;
}

export function EditFeedbackDialog({
  isOpen,
  editType,
  originalValue,
  newValue,
  targetElement,
  onSkip,
  onSubmit,
}: EditFeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calculate position relative to target element
  useEffect(() => {
    if (isOpen && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      setPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.left + scrollX + rect.width / 2,
      });
      // Position invisible trigger at target location
      if (triggerRef.current) {
        triggerRef.current.style.position = "fixed";
        triggerRef.current.style.left = `${rect.left + rect.width / 2}px`;
        triggerRef.current.style.top = `${rect.bottom + 8}px`;
        triggerRef.current.style.transform = "translateX(-50%)";
      }
    } else if (isOpen) {
      // Center if no target element
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
    }
  }, [isOpen, targetElement]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleSkip();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (feedbackText.trim()) {
      setIsSubmitting(true);
      try {
        await onSubmit(feedbackText.trim());
      } finally {
        setIsSubmitting(false);
        setFeedbackText("");
      }
    } else {
      onSkip();
    }
  };

  const handleSkip = () => {
    setFeedbackText("");
    onSkip();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible trigger positioned at target element */}
      <button
        ref={triggerRef}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: "fixed",
          opacity: 0,
          pointerEvents: "none",
          width: "1px",
          height: "1px",
        }}
      />

      <Popover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleSkip()}
        placement="bottom"
        offset={8}
        className="bg-[#0d0e14]/95 backdrop-blur-xl border border-slate-700/40 rounded-lg shadow-2xl p-2.5 min-w-[240px] max-w-[320px] entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95"
      >
        <div
          ref={containerRef}
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm text-slate-300">Why?</span>
          <input
            ref={inputRef}
            type="text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Brief explanation..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
            disabled={isSubmitting}
          />
          <button
            onClick={handleSkip}
            className="p-1 rounded hover:bg-slate-700/30 transition-colors text-slate-400 hover:text-slate-300"
            aria-label="Cancel"
            disabled={isSubmitting}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSubmit}
            className="p-1 rounded hover:bg-slate-700/30 transition-colors text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Save"
            disabled={isSubmitting || !feedbackText.trim()}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </Popover>
    </>
  );
}
