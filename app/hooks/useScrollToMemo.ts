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
      // Could be in a link href, data attribute, or id
      const element =
        document.querySelector(`[href*="#memo-${memoId}"]`) ||
        document.querySelector(`[href*="/#memo-${memoId}"]`) ||
        document.querySelector(`[data-memo-id="${memoId}"]`) ||
        document.querySelector(`#memo-${memoId}`);

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
          element.classList.remove(glowClass);
        }, 2000);

        // Clean up URL param after scrolling
        const url = new URL(window.location.href);
        url.searchParams.delete("memoId");
        window.history.replaceState({}, "", url.toString());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [memoId]);
}
