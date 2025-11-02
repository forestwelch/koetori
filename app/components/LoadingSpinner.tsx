/**
 * Reusable loading spinner component
 * Used to show loading states consistently across the app
 * Audio waveform-style bars animation
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const barCount = 9;
  const barConfig = {
    sm: { width: "0.2rem", containerHeight: "3rem", minHeight: "0.4rem" },
    md: { width: "0.25rem", containerHeight: "3.5rem", minHeight: "0.5rem" },
    lg: { width: "0.3rem", containerHeight: "4rem", minHeight: "0.6rem" },
  };

  const config = barConfig[size];

  // Generate initial randomized heights and animation properties
  const barAnimations = Array.from({ length: barCount }).map((_, i) => {
    const baseDelay = i * 80;
    const randomOffset = (i % 3) * 40;
    const delay = baseDelay + randomOffset;
    const duration = 0.5 + (i % 4) * 0.15;
    // Random starting height (between 1x and 3x minHeight)
    const startMultiplier = 1 + ((i % 7) / 7) * 2;
    const startHeight = `${parseFloat(config.minHeight) * startMultiplier}rem`;
    // Peak height (between 1.5x and 4x minHeight)
    const peakMultiplier = 1.5 + ((i % 5) / 5) * 2.5;
    const peakHeight = `${parseFloat(config.minHeight) * peakMultiplier}rem`;
    return { delay, duration, startHeight, peakHeight };
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
      <div className="py-12 text-center" role="status" aria-live="polite">
        <div
          className="flex items-end justify-center gap-0.5"
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
        {message && <p className="mt-4 text-[#94a3b8] text-sm">{message}</p>}
      </div>
    </>
  );
}
