"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "../lib/ui-utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);

      // Hide "back online" message after 3 seconds
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't show anything if online and indicator was dismissed
  if (isOnline && !showIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        showIndicator
          ? "animate-in slide-in-from-top duration-300"
          : "animate-out slide-out-to-top duration-300"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-xl border",
          isOnline
            ? "bg-emerald-500/90 border-emerald-400/50 text-white"
            : "bg-orange-500/90 border-orange-400/50 text-white"
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You&apos;re offline - some features may be limited
            </span>
          </>
        )}
      </div>
    </div>
  );
}
