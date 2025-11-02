/**
 * Reusable loading spinner component
 * Used to show loading states consistently across the app
 * Audio waveform-style bars animation
 */

import { useMemo } from "react";

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

  // Generate wave pattern with smooth transitions
  // Uses a wave function to create peaks and valleys that flow naturally
  const barAnimations = useMemo(() => {
    const maxHeightValue = parseFloat(config.maxHeight);
    const centerPoint = maxHeightValue / 2;

    // Create a base wave pattern - multiple overlapping sine waves for natural variation
    const wavePattern = Array.from({ length: barCount }).map((_, i) => {
      const position = i / barCount; // 0 to 1

      // Multiple wave frequencies for complexity
      const wave1 = Math.sin(position * Math.PI * 4) * 0.4; // Fast wave
      const wave2 = Math.sin(position * Math.PI * 2) * 0.3; // Medium wave
      const wave3 = Math.sin(position * Math.PI * 0.8) * 0.3; // Slow wave

      // Combine waves with some randomness for organic feel
      const waveValue = wave1 + wave2 + wave3 + (Math.random() - 0.5) * 0.2;

      // Convert to height offset from center
      const baseOffset = waveValue * (maxHeightValue / 2) * 0.8; // 80% of max range

      // Each bar has different extents but related to neighbors
      const upExtent = (0.3 + Math.abs(waveValue) * 0.7) * (maxHeightValue / 2);
      const downExtent =
        (0.3 + Math.abs(waveValue) * 0.7) * (maxHeightValue / 2);

      // Smooth delays - bars near each other animate close together
      const delay = i * 30 + Math.random() * 100; // Sequential with small random offset

      // Duration varies but not too much
      const duration = 0.5 + Math.random() * 0.4; // 0.5-0.9s for smoother feel

      // Starting height follows the wave pattern
      const startAboveCenter = baseOffset;
      const startHeight = `${centerPoint + startAboveCenter}rem`;

      // Peak oscillates around the wave pattern position
      const oscillation = (Math.random() - 0.5) * (upExtent + downExtent) * 0.6;
      const peakAboveCenter = baseOffset + oscillation;
      const peakHeight = `${Math.max(0.2, Math.min(maxHeightValue - 0.2, centerPoint + peakAboveCenter))}rem`;

      return { delay, duration, startHeight, peakHeight };
    });

    return wavePattern;
  }, [barCount, config.maxHeight]);

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
