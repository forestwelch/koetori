import { Star, Archive } from "lucide-react";

interface SwipeIndicatorProps {
  swipeX: number;
}

export function SwipeIndicator({ swipeX }: SwipeIndicatorProps) {
  // Calculate opacity based on swipe distance
  // Max opacity at 100px swipe (the threshold)
  const maxSwipe = 100;

  // Left swipe (star) - negative values
  const leftSwipeProgress = Math.min(
    Math.abs(Math.min(swipeX, 0)) / maxSwipe,
    1
  );
  const showLeftIndicator = swipeX < 0;

  // Right swipe (archive) - positive values
  const rightSwipeProgress = Math.min(Math.max(swipeX, 0) / maxSwipe, 1);
  const showRightIndicator = swipeX > 0;

  return (
    <>
      {/* Star indicator (swipe left) */}
      {showLeftIndicator && (
        <div
          className="absolute inset-0 bg-amber-500 rounded-2xl pointer-events-none transition-opacity duration-75 flex items-center justify-center z-10"
          style={{ opacity: leftSwipeProgress * 0.15 }}
        >
          <Star
            className="w-16 h-16 sm:w-36 sm:h-36 text-amber-900 drop-shadow-2xl"
            style={{ opacity: Math.max(leftSwipeProgress * 2, 0.9) }}
            strokeWidth={2.5}
          />
        </div>
      )}

      {/* Archive indicator (swipe right) */}
      {showRightIndicator && (
        <div
          className="absolute inset-0 bg-slate-500 rounded-2xl pointer-events-none transition-opacity duration-75 flex items-center justify-center z-10"
          style={{ opacity: rightSwipeProgress * 0.15 }}
        >
          <Archive
            className="w-16 h-16 sm:w-36 sm:h-36 text-slate-50 drop-shadow-2xl"
            style={{ opacity: Math.max(rightSwipeProgress * 2, 0.9) }}
            strokeWidth={2.5}
          />
        </div>
      )}
    </>
  );
}
