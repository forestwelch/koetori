"use client";

import { useMemo } from "react";
import { Memo } from "../../types/memo";
import { cn } from "../../lib/ui-utils";
import { AlertCircle, Star, Clock, TrendingUp, Sparkles } from "lucide-react";

interface MemoBadgesProps {
  memo: Memo;
}

export function MemoBadges({ memo }: MemoBadgesProps) {
  const badges = useMemo(() => {
    const badges: Array<{
      label: string;
      icon?: React.ComponentType<{ className?: string }>;
      color: string;
      priority: number;
    }> = [];

    // Needs review badge (highest priority)
    if (memo.needs_review || memo.confidence < 0.7) {
      badges.push({
        label: "Review",
        icon: AlertCircle,
        color: "red",
        priority: 1,
      });
    }

    // Starred badge
    if (memo.starred) {
      badges.push({
        label: "Starred",
        icon: Star,
        color: "yellow",
        priority: 2,
      });
    }

    // Days old badge
    const daysOld = Math.floor(
      (Date.now() - memo.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOld > 7) {
      badges.push({
        label: `${daysOld}d old`,
        icon: Clock,
        color: "orange",
        priority: 3,
      });
    } else if (daysOld > 3) {
      badges.push({
        label: `${daysOld}d old`,
        icon: Clock,
        color: "amber",
        priority: 4,
      });
    }

    // Confidence badge (only if not needs review)
    if (!memo.needs_review) {
      const confidencePercent = Math.round(memo.confidence * 100);
      if (confidencePercent >= 95) {
        badges.push({
          label: `${confidencePercent}%`,
          icon: TrendingUp,
          color: "emerald",
          priority: 5,
        });
      } else if (confidencePercent >= 85) {
        badges.push({
          label: `${confidencePercent}%`,
          icon: TrendingUp,
          color: "blue",
          priority: 5,
        });
      }
    }

    // Sort by priority
    return badges.sort((a, b) => a.priority - b.priority);
  }, [memo]);

  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <span
            key={idx}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              `bg-${badge.color}-500/20 text-${badge.color}-400 border border-${badge.color}-500/30`
            )}
            title={badge.label}
          >
            {Icon && <Icon className="w-3 h-3" />}
            <span>{badge.label}</span>
          </span>
        );
      })}
    </div>
  );
}
