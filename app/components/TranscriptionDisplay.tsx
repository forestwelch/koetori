"use client";

import { useState } from "react";

interface TranscriptionDisplayProps {
  text: string;
}

export function TranscriptionDisplay({ text }: TranscriptionDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="w-full p-4 sm:p-6 bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30"
      role="region"
      aria-label="Transcription result"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#e2e8f0] text-sm sm:text-base font-light">
          Transcription
        </h3>
        <button
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy transcription to clipboard"}
          className="text-xs sm:text-sm font-light text-[#818cf8] hover:text-[#6366f1] transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <p className="text-[#94a3b8] text-sm sm:text-base font-light leading-relaxed">
        {text}
      </p>
    </div>
  );
}
