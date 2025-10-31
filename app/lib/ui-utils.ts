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
import { getCategoryDisplayLabel } from "./constants";

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
const categoryIconColorMap: Record<Category, string> = {
  journal: "text-emerald-300",
  media: "text-sky-300",
  event: "text-amber-300",
  therapy: "text-rose-300",
  tarot: "text-purple-300",
  todo: "text-yellow-300",
  idea: "text-violet-300",
  "to buy": "text-cyan-300",
  other: "text-slate-300",
};

export function getCategoryIconColor(category: Category) {
  return categoryIconColorMap[category] || categoryIconColorMap.other;
}

export function getCategoryBadgeCompact(category: Category) {
  return cn(
    "inline-flex h-5 w-5 items-center justify-center text-slate-300",
    getCategoryIconColor(category)
  );
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

// Category display labels - now uses centralized constants
export function getCategoryLabel(category: Category) {
  return getCategoryDisplayLabel(category);
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
