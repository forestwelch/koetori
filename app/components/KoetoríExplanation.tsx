"use client";

import { useState, useEffect } from "react";

interface KoetoríExplanationProps {
  children: React.ReactNode;
}

export function KoetoríExplanation({ children }: KoetoríExplanationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClick = () => {
    if (isMobile) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <div
        className="cursor-pointer relative group inline-block"
        onClick={handleClick}
      >
        {children}
        {/* Dotted underline indicator - always visible */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 border-b border-dotted border-slate-400/50 group-hover:border-slate-300/70 transition-colors" />

        {/* Desktop hover popup */}
        {!isMobile && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 bg-[#1e1f2a]/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            <div className="text-center">
              {/* Bird emoji */}
              <div className="text-2xl mb-3">🐦</div>

              {/* Japanese characters */}
              <div className="flex items-center justify-center gap-2 mb-3 text-sm">
                <span className="text-slate-300">
                  <span className="text-[#818cf8]">声</span> (koe) = voice
                </span>
                <span className="text-slate-500">+</span>
                <span className="text-slate-300">
                  <span className="text-[#c084fc]">取り</span> (tori) = capture
                </span>
              </div>

              {/* Complete explanation */}
              <p className="text-slate-300 text-xs leading-relaxed">
                It&apos;s a double entendre!{" "}
                <span className="text-[#fb7185]">Tori</span> also means bird, so
                it&apos;s like a birdsong. Capture your ideas using your voice
                before they fly away into the night. 🌙
              </p>
            </div>

            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-700/50"></div>
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#1e1f2a]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="text-center">
              {/* Bird emoji */}
              <div className="text-4xl mb-4">🐦</div>

              {/* Title with gradient */}
              <h2 className="text-2xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent mb-4">
                Koetori
              </h2>

              {/* Japanese characters */}
              <div className="flex items-center justify-center gap-3 mb-4 text-lg">
                <span className="text-slate-300">
                  <span className="text-[#818cf8]">声</span> (koe) = voice
                </span>
                <span className="text-slate-500">+</span>
                <span className="text-slate-300">
                  <span className="text-[#c084fc]">取り</span> (tori) = capture
                </span>
              </div>

              {/* Explanation */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                It&apos;s a double entendre!{" "}
                <span className="text-[#fb7185]">Tori</span> also means bird, so
                it&apos;s like a birdsong. The idea is you can capture your
                ideas using your voice before they fly away into the night. 🌙
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
