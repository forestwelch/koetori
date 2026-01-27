import { useState, useRef } from "react";

/**
 * Hook to handle swipe gestures on memo items
 * Swipe right = archive, swipe left = star
 */
export function useSwipeGesture(
  onSwipeRight: () => void,
  onSwipeLeft: () => void
) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Prevent page scroll when swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }

    setSwipeX(diff);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeX) > 100) {
      if (swipeX < 0) {
        onSwipeLeft(); // Swiped left = star
      } else {
        onSwipeRight(); // Swiped right = archive
      }
    }
    setSwipeX(0);
    setIsSwiping(false);
  };

  return {
    swipeX,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
