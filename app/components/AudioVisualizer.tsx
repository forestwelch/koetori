"use client";

import { useEffect, useRef, useState } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
  stream: MediaStream | null;
}

export function AudioVisualizer({
  isRecording,
  stream,
}: AudioVisualizerProps) {
  const [levels, setLevels] = useState<number[]>(Array(20).fill(0));
  const animationFrameRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isRecording || !stream) {
      setLevels(Array(20).fill(0));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Set up audio analysis
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyzer.fftSize = 64;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      if (!analyzerRef.current || !isRecording) return;

      analyzerRef.current.getByteFrequencyData(dataArray);

      // Sample 20 points from the frequency data
      const newLevels = Array(20)
        .fill(0)
        .map((_, i) => {
          const index = Math.floor((i * bufferLength) / 20);
          return dataArray[index] / 255; // Normalize to 0-1
        });

      setLevels(newLevels);
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, stream]);

  if (!isRecording) return null;

  return (
    <div
      className="flex items-center justify-center gap-0.5 sm:gap-1 h-12 sm:h-16 w-full"
      role="img"
      aria-label="Audio level visualization"
    >
      {levels.map((level, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-[#6366f1] to-[#818cf8] rounded-full transition-all duration-75"
          style={{
            height: `${Math.max(level * 100, 10)}%`,
            opacity: 0.3 + level * 0.7,
          }}
        />
      ))}
    </div>
  );
}
