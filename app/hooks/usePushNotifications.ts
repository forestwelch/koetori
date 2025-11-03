"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if service worker and push manager are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);

      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Get existing subscription
          return registration.pushManager.getSubscription();
        })
        .then((sub) => {
          setSubscription(sub);
        })
        .catch((err) => {
          console.error("Service worker registration failed:", err);
        });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      showError("Push notifications are not supported in your browser");
      return;
    }

    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Create subscription
      // In production, you'd get the VAPID public key from your server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      setSubscription(sub);

      // Send subscription to server
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      showSuccess("Push notifications enabled");
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to enable notifications: ${error.message}`
          : "Failed to enable notifications"
      );
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported, showSuccess, showError]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();

      // Remove from server
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setSubscription(null);
      showSuccess("Push notifications disabled");
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to disable notifications: ${error.message}`
          : "Failed to disable notifications"
      );
    }
  }, [subscription, showSuccess, showError]);

  // Listen for service worker messages (notification actions)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SNOOZE_REMINDER") {
        // Handle snooze
        console.log("Snooze reminder:", event.data.reminderId);
      } else if (event.data?.type === "COMPLETE_REMINDER") {
        // Handle complete
        console.log("Complete reminder:", event.data.reminderId);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  return {
    isSupported,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
    isSubscribing,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
