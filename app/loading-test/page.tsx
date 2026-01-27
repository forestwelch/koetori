"use client";

import { useState } from "react";

interface SpinnerVariant {
  name: string;
  description: string;
  barCount: number;
  generateAnimation: (
    i: number,
    barCount: number
  ) => {
    delay: number;
    duration: number;
    startHeight: string;
    peakHeight: string;
  };
}

const variants: SpinnerVariant[] = [
  {
    name: "1. Current Smooth Wave",
    description: "Smooth sine wave pattern (current)",
    barCount: 15,
    generateAnimation: (i, barCount) => {
      const position = i / barCount;
      const wave1 = Math.sin(position * Math.PI * 4) * 0.4;
      const wave2 = Math.sin(position * Math.PI * 2) * 0.3;
      const wave3 = Math.sin(position * Math.PI * 0.8) * 0.3;
      const waveValue = wave1 + wave2 + wave3 + (Math.random() - 0.5) * 0.2;
      const centerPoint = 3;
      const baseOffset = waveValue * 1.2;
      return {
        delay: i * 30 + Math.random() * 100,
        duration: 0.5 + Math.random() * 0.4,
        startHeight: `${centerPoint + baseOffset}rem`,
        peakHeight: `${Math.max(0.2, Math.min(5.8, centerPoint + baseOffset + (Math.random() - 0.5) * 2))}rem`,
      };
    },
  },
  {
    name: "2. Chaotic Independent",
    description: "Each bar random, no pattern",
    barCount: 15,
    generateAnimation: (i, barCount) => {
      return {
        delay: Math.random() * 500,
        duration: 0.3 + Math.random() * 0.6,
        startHeight: `${0.5 + Math.random() * 2}rem`,
        peakHeight: `${2 + Math.random() * 4}rem`,
      };
    },
  },
  {
    name: "3. Beat Reactive",
    description: "Quick up, slow down (bass hits)",
    barCount: 15,
    generateAnimation: (i, barCount) => {
      const lowHeight = 0.4 + Math.random() * 1;
      const highHeight = 2 + Math.random() * 4;
      return {
        delay: i * 40,
        duration: 0.5 + Math.random() * 0.3,
        startHeight: `${lowHeight}rem`,
        peakHeight: `${highHeight}rem`,
      };
    },
  },
  {
    name: "4. Staggered Wave",
    description: "Cascading left to right",
    barCount: 15,
    generateAnimation: (i, barCount) => {
      const position = i / barCount;
      const height = 1 + Math.sin(position * Math.PI) * 3;
      return {
        delay: i * 60,
        duration: 0.6,
        startHeight: "0.5rem",
        peakHeight: `${height}rem`,
      };
    },
  },
  {
    name: "5. Mirror Pattern",
    description: "Symmetrical from center",
    barCount: 15,
    generateAnimation: (i, barCount) => {
      const center = barCount / 2;
      const distFromCenter = Math.abs(i - center) / center;
      const height = 1 + (1 - distFromCenter) * 4;
      return {
        delay: Math.abs(i - center) * 50,
        duration: 0.5 + Math.random() * 0.3,
        startHeight: "0.5rem",
        peakHeight: `${height}rem`,
      };
    },
  },
  {
    name: "6. Punchy Chaos",
    description: "Fast, sharp, unpredictable",
    barCount: 20,
    generateAnimation: (i, barCount) => {
      const isPeak = Math.random() > 0.6;
      return {
        delay: Math.random() * 400,
        duration: 0.25 + Math.random() * 0.35,
        startHeight: "0.3rem",
        peakHeight: isPeak
          ? `${4 + Math.random() * 2}rem`
          : `${1 + Math.random() * 2}rem`,
      };
    },
  },
  {
    name: "7. Smooth Ripple",
    description: "Gentle wave propagation",
    barCount: 15,
    generateAnimation: (i, barCount) => {
      const position = i / barCount;
      const wave = Math.sin(position * Math.PI * 2);
      const height = 2 + wave * 2.5;
      return {
        delay: i * 50,
        duration: 0.7,
        startHeight: `${height * 0.5}rem`,
        peakHeight: `${height}rem`,
      };
    },
  },
  {
    name: "8. Sparse Peaks",
    description: "Few tall bars, many short",
    barCount: 18,
    generateAnimation: (i, barCount) => {
      const isTall = i % 4 === 0;
      return {
        delay: i * 35 + Math.random() * 80,
        duration: 0.4 + Math.random() * 0.4,
        startHeight: "0.4rem",
        peakHeight: isTall
          ? `${4 + Math.random() * 1.5}rem`
          : `${0.8 + Math.random() * 1.2}rem`,
      };
    },
  },
  {
    name: "9. Double Wave",
    description: "Two alternating patterns",
    barCount: 16,
    generateAnimation: (i, barCount) => {
      const isEven = i % 2 === 0;
      const position = i / barCount;
      const wave = Math.sin(position * Math.PI * 3);
      const baseHeight = 2 + wave * 1.5;
      return {
        delay: i * 40,
        duration: 0.55,
        startHeight: "0.5rem",
        peakHeight: isEven ? `${baseHeight}rem` : `${baseHeight + 1.5}rem`,
      };
    },
  },
  {
    name: "10. True Visualizer",
    description: "Realistic audio spectrum",
    barCount: 20,
    generateAnimation: (i, barCount) => {
      // Lower frequencies (left) = taller, slower
      // Higher frequencies (right) = shorter, faster
      const position = i / barCount;
      const bassBoost = position < 0.3 ? 2 : 1;
      const heightMultiplier = Math.max(0.3, 1 - position * 0.5);

      return {
        delay: Math.random() * 300,
        duration: 0.3 + position * 0.4 + Math.random() * 0.2,
        startHeight: `${0.3 + Math.random() * 0.5}rem`,
        peakHeight: `${(1 + Math.random() * 4) * heightMultiplier * bassBoost}rem`,
      };
    },
  },
];

function VariantSpinner({
  variant,
  index,
}: {
  variant: SpinnerVariant;
  index: number;
}) {
  const [animations] = useState(() =>
    Array.from({ length: variant.barCount }).map((_, i) =>
      variant.generateAnimation(i, variant.barCount)
    )
  );

  // Create valid CSS identifier
  const variantId = `v${index}`;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-800/30 rounded-xl border border-slate-700/40">
      <div>
        <h3 className="text-white font-semibold text-sm mb-1">
          {variant.name}
        </h3>
        <p className="text-slate-400 text-xs">{variant.description}</p>
      </div>

      <style>{`
        ${animations
          .map(
            (anim, i) => `
          @keyframes wave-${variantId}-${i} {
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
        className="flex items-center justify-center gap-1"
        style={{
          height: "6rem",
          position: "relative",
        }}
      >
        {Array.from({ length: variant.barCount }).map((_, i) => {
          const anim = animations[i];
          return (
            <div
              key={i}
              className="rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500"
              style={{
                width: "0.2rem",
                height: anim.startHeight,
                minHeight: "0.3rem",
                animation: `wave-${variantId}-${i} ${anim.duration}s ease-in-out infinite`,
                animationDelay: `${anim.delay}ms`,
                transformOrigin: "center center",
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}

export default function LoadingTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0e14] to-[#0f1117] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loading Spinner Test Lab</h1>
          <p className="text-slate-400">
            Pick your favorite audio visualizer vibe. All animations loop at
            current speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map((variant, index) => (
            <VariantSpinner
              key={variant.name}
              variant={variant}
              index={index}
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
          <p className="text-slate-400 text-sm">
            💡 <strong>Tip:</strong> Visit{" "}
            <code className="text-indigo-300">/loading-test</code> to see this
            page. Each variant uses different patterns - some smooth, some
            chaotic, some beat-reactive.
          </p>
        </div>
      </div>
    </div>
  );
}
