"use client";

import { useMemo } from "react";
import { Memo, Category } from "../../types/memo";
import { Card } from "../ui/Card";
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  Film,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/ui-utils";

export type InboxSection =
  | "needs_review"
  | "high_confidence"
  | "todays_memos"
  | "media_to_enrich"
  | "all";

export interface PowerInboxSectionsProps {
  memos: Memo[];
  activeSection: InboxSection;
  onSectionChange: (section: InboxSection) => void;
}

interface SectionConfig {
  id: InboxSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count: number;
  color: string;
}

export function PowerInboxSections({
  memos,
  activeSection,
  onSectionChange,
}: PowerInboxSectionsProps) {
  const sections = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const needsReview = memos.filter(
      (m) => m.needs_review || m.confidence < 0.7
    );
    const highConfidence = memos.filter(
      (m) => !m.needs_review && m.confidence >= 0.85
    );
    const todaysMemos = memos.filter((m) => {
      const memoDate = new Date(m.timestamp);
      return memoDate >= today;
    });
    const mediaToEnrich = memos.filter(
      (m) => m.category === "media" && !m.needs_review && m.confidence >= 0.7
    );

    const configs: SectionConfig[] = [
      {
        id: "all",
        label: "All",
        icon: Sparkles,
        description: "All inbox memos",
        count: memos.length,
        color: "slate",
      },
      {
        id: "needs_review",
        label: "Needs Review",
        icon: AlertCircle,
        description: "Low confidence or flagged",
        count: needsReview.length,
        color: "red",
      },
      {
        id: "high_confidence",
        label: "High Confidence",
        icon: CheckCircle2,
        description: "Ready to process",
        count: highConfidence.length,
        color: "emerald",
      },
      {
        id: "todays_memos",
        label: "Today's Memos",
        icon: Calendar,
        description: "Created today",
        count: todaysMemos.length,
        color: "indigo",
      },
      {
        id: "media_to_enrich",
        label: "Media to Enrich",
        icon: Film,
        description: "Ready for metadata",
        count: mediaToEnrich.length,
        color: "purple",
      },
    ];

    return configs;
  }, [memos]);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
              "hover:border-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d0e14]",
              isActive
                ? `bg-${section.color}-500/20 border-${section.color}-500/50 text-${section.color}-400 focus:ring-${section.color}-500`
                : "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-800/50",
              section.count === 0 && "opacity-50 cursor-not-allowed"
            )}
            disabled={section.count === 0 && !isActive}
            title={section.description}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{section.label}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                isActive
                  ? `bg-${section.color}-500/30 text-${section.color}-300`
                  : "bg-slate-700/50 text-slate-400"
              )}
            >
              {section.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function filterMemosBySection(
  memos: Memo[],
  section: InboxSection
): Memo[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (section) {
    case "needs_review":
      return memos.filter((m) => m.needs_review || m.confidence < 0.7);

    case "high_confidence":
      return memos.filter((m) => !m.needs_review && m.confidence >= 0.85);

    case "todays_memos":
      return memos.filter((m) => {
        const memoDate = new Date(m.timestamp);
        return memoDate >= today;
      });

    case "media_to_enrich":
      return memos.filter(
        (m) => m.category === "media" && !m.needs_review && m.confidence >= 0.7
      );

    case "all":
    default:
      return memos;
  }
}
