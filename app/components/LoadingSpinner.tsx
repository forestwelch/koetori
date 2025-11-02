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

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const barCount = 15;
  const barConfig = {
    sm: { width: "0.2rem", containerHeight: "12rem", minHeight: "1.2rem" },
    md: { width: "0.2rem", containerHeight: "15rem", minHeight: "1.5rem" },
    lg: { width: "0.2rem", containerHeight: "18rem", minHeight: "1.8rem" },
  };

  const config = barConfig[size];

  // Generate initial randomized heights and animation properties
  // useMemo ensures these values are generated once per mount and stay consistent during that render
  const barAnimations = useMemo(() => {
    return Array.from({ length: barCount }).map((_, i) => {
      const baseDelay = i * 60;
      const randomOffset = Math.random() * 100; // Random delay offset (0-100ms)
      const delay = baseDelay + randomOffset;
      const duration = 0.4 + Math.random() * 0.4; // Random duration (0.4-0.8s)
      // Random starting height (between 0.5x and 2.5x minHeight)
      const startMultiplier = 0.5 + Math.random() * 2;
      const startHeight = `${parseFloat(config.minHeight) * startMultiplier}rem`;
      // Peak height (between 1.5x and 4x minHeight)
      const peakMultiplier = 1.5 + Math.random() * 2.5;
      const peakHeight = `${parseFloat(config.minHeight) * peakMultiplier}rem`;
      return { delay, duration, startHeight, peakHeight };
    });
  }, [barCount, config.minHeight]); // Regenerate when these change

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
      <div className="py-12 text-center" role="status" aria-live="polite">
        <div
          className="flex items-end justify-center gap-1"
          style={{
            height: config.containerHeight,
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
                  alignSelf: "flex-end",
                  transformOrigin: "bottom center",
                }}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
