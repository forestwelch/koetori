import { Star, Archive } from "lucide-react";

interface SwipeIndicatorProps {
  swipeX: number;
}

export function SwipeIndicator({ swipeX }: SwipeIndicatorProps) {
  return (
    <>
      {/* Star indicator (swipe left) */}
      {swipeX < -50 && (
        <div className="absolute inset-0 bg-amber-500/20 rounded-2xl pointer-events-none transition-opacity">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      )}

      {/* Archive indicator (swipe right) */}
      {swipeX > 50 && (
        <div className="absolute inset-0 bg-slate-500/20 rounded-2xl pointer-events-none transition-opacity">
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Archive className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      )}
    </>
  );
}
