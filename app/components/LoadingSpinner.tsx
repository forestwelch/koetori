/**
 * Reusable loading spinner component
 * Used to show loading states consistently across the app
 * Audio waveform-style bars animation
 */

import { useState, useMemo } from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message, size = "md" }: LoadingSpinnerProps) {
  const barCount = 15;
  const barConfig = {
    sm: {
      width: "0.2rem",
      minHeight: "0.3rem",
      maxHeight: "5rem",
    },
    md: {
      width: "0.2rem",
      minHeight: "0.4rem",
      maxHeight: "6rem",
    },
    lg: {
      width: "0.2rem",
      minHeight: "0.5rem",
      maxHeight: "7.5rem",
    },
  };

  const config = barConfig[size];

  // Generate staggered wave pattern - cascading left to right
  // Uses useState to initialize values once (fixes hydration mismatch)
  // The function initializer only runs once on the client after hydration
  const [barAnimations] = useState(() => {
    // Staggered wave: bars animate in sequence with heights following a sine wave
    const wavePattern = Array.from({ length: barCount }).map((_, i) => {
      const position = i / barCount; // 0 to 1

      const lowHeight = 0.4 + Math.random() * 1;
      const peakHeight = 2 + Math.random() * 4;
      return {
        delay: i * 40,
        duration: 0.5 + Math.random() * 0.3,
        startHeight: `${lowHeight}rem`,
        peakHeight: `${peakHeight}rem`,
      };
    });

    return wavePattern;
  });

  return (
    <>
      <style>{`
        ${barAnimations
          .map(
            (anim, i) => `
          @keyframes wave-${size}-${i} {
            0%, 100% {
              height: ${anim.startHeight};
              opacity: 0.7;
            }
            50% {
              height: ${anim.peakHeight};
              opacity: 1;
            }
          }
        `
          )
          .join("")}
      `}</style>
      <div
        className="flex flex-col items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div
          className="flex items-center justify-center gap-1"
          style={{
            height: config.maxHeight,
            position: "relative",
          }}
        >
          {Array.from({ length: barCount }).map((_, i) => {
            const anim = barAnimations[i];
            return (
              <div
                key={i}
                className="rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500"
                style={{
                  width: config.width,
                  height: anim.startHeight, // Start at randomized height
                  minHeight: config.minHeight,
                  animation: `wave-${size}-${i} ${anim.duration}s ease-in-out infinite`,
                  animationDelay: `${anim.delay}ms`,
                  transformOrigin: "center center",
                }}
                aria-hidden="true"
              />
            );
          })}
        </div>
        {message && <p className="mt-4 text-[#94a3b8] text-base">{message}</p>}
      </div>
    </>
  );
}
