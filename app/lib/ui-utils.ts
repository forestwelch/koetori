import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Film,
  Calendar,
  BookOpen,
  Heart,
  Sparkles,
  CheckSquare,
  Lightbulb,
  ShoppingCart,
  HelpCircle,
} from "lucide-react";
import { Category } from "../types/memo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Category icon mapping
export function getCategoryIcon(category: Category) {
  const iconMap: Record<
    Category,
    React.ComponentType<{ className?: string }>
  > = {
    journal: BookOpen,
    media: Film, //
    event: Calendar,
    therapy: Heart,
    tarot: Sparkles,
    todo: CheckSquare,
    idea: Lightbulb,
    "to buy": ShoppingCart,
    other: HelpCircle,
  };

  return iconMap[category] || HelpCircle;
}

// Category badge styling
export function getCategoryBadgeCompact(category: Category) {
  const badgeMap: Record<Category, string> = {
    journal:
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-green-500/10 text-green-300 border-green-500/40",
    media:
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-blue-500/10 text-blue-300 border-blue-500/40",
    event:
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-orange-500/10 text-orange-300 border-orange-500/40",
    therapy:
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-pink-500/10 text-pink-300 border-pink-500/40",
    tarot:
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-purple-500/10 text-purple-300 border-purple-500/40",
    todo: "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-yellow-500/10 text-yellow-300 border-yellow-500/40",
    idea: "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-violet-500/10 text-violet-300 border-violet-500/40",
    "to buy":
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-cyan-500/10 text-cyan-300 border-cyan-500/40",
    other:
      "inline-flex items-center justify-center w-8 h-8 rounded-xl border bg-gray-500/10 text-gray-300 border-gray-500/40",
  };

  return badgeMap[category] || badgeMap.other;
}

// Category color classes for dropdowns
export function getCategoryColor(category: Category) {
  const colorMap: Record<Category, string> = {
    journal: "bg-green-500/30",
    media: "bg-blue-500/30",
    event: "bg-orange-500/30",
    therapy: "bg-pink-500/30",
    tarot: "bg-purple-500/30",
    todo: "bg-yellow-500/30",
    idea: "bg-violet-500/30",
    "to buy": "bg-cyan-500/30",
    other: "bg-gray-500/30",
  };

  return colorMap[category] || colorMap.other;
}

// Category display labels
export function getCategoryLabel(category: Category) {
  const labelMap: Record<Category, string> = {
    journal: "Journal",
    media: "Media",
    event: "Event",
    therapy: "Therapy",
    tarot: "Tarot",
    todo: "Todo",
    idea: "Idea",
    "to buy": "To Buy",
    other: "Other",
  };

  return labelMap[category] || labelMap.other;
}

// Format confidence as percentage
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

// Category gradient classes
export function getCategoryGradient(category: Category): string {
  const gradientMap: Record<Category, string> = {
    journal: "from-green-500 to-emerald-500",
    media: "from-blue-500 to-cyan-500",
    event: "from-orange-500 to-amber-500",
    therapy: "from-pink-500 to-rose-500",
    tarot: "from-purple-500 to-violet-500",
    todo: "from-yellow-500 to-orange-500",
    idea: "from-violet-500 to-purple-500",
    "to buy": "from-cyan-500 to-blue-500",
    other: "from-gray-500 to-slate-500",
  };

  return gradientMap[category] || gradientMap.other;
}
