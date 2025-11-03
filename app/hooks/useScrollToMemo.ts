"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Hook to scroll to and highlight a memo when memoId is in URL params
 */
export function useScrollToMemo() {
  const searchParams = useSearchParams();
  const memoId = searchParams.get("memoId");

  useEffect(() => {
    if (!memoId) return;

    // Wait a bit for the page to render
    const timer = setTimeout(() => {
      // Try to find the element by memo ID
      // Priority: data attribute, then href links, then id
      let element: Element | null = null;

      // First try data-memo-id attribute (most reliable)
      element = document.querySelector(`[data-memo-id="${memoId}"]`);

      // If not found, try href links that contain the memo ID
      if (!element) {
        element =
          document.querySelector(`[href*="#memo-${memoId}"]`) ||
          document.querySelector(`[href*="/#memo-${memoId}"]`);
      }

      // Last resort: try ID attribute
      if (!element) {
        element = document.querySelector(`#memo-${memoId}`);
      }

      if (element) {
        // Scroll to element
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Add glow effect
        const glowClass = "memo-highlight-glow";
        element.classList.add(glowClass);

        // Remove glow after 2 seconds
        setTimeout(() => {
          element?.classList.remove(glowClass);
        }, 2000);

        // Clean up URL param after scrolling
        const url = new URL(window.location.href);
        url.searchParams.delete("memoId");
        window.history.replaceState({}, "", url.toString());
      } else {
        // If element not found, try navigating to inbox with hash
        // This handles cases where the memo is on the inbox page
        const url = new URL(window.location.href);
        url.searchParams.delete("memoId");
        url.pathname = "/";
        url.hash = `memo-${memoId}`;
        window.location.href = url.toString();
      }
    }, 800); // Increased delay for enrichment pages to load

    return () => clearTimeout(timer);
  }, [memoId]);
}
