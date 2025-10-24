"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const isInStandaloneMode = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone) ||
      document.referrer.includes("android-app://");

    setIsStandalone(isInStandaloneMode());

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      return;
    }

    // Listen for the install prompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show prompt after 30 seconds if not installed
    if (iOS && !isInStandaloneMode()) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    // User made a choice - hide the prompt regardless of outcome
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <Card variant="elevated" padding="md" className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-8 h-8"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-start gap-4 pr-8">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
            🐔
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-white font-semibold text-lg">
                Install Koetori
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {isIOS
                  ? "Add to your home screen for quick access"
                  : "Install for a better experience"}
              </p>
            </div>

            {isIOS ? (
              <div className="space-y-2 text-sm text-slate-300">
                <p className="flex items-center gap-2">
                  1. Tap the{" "}
                  <Share className="w-4 h-4 inline text-indigo-400" /> share
                  button
                </p>
                <p>2. Scroll and tap &quot;Add to Home Screen&quot;</p>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleInstallClick}
                leftIcon={<Download className="w-4 h-4" />}
                className="w-full"
              >
                Install App
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
