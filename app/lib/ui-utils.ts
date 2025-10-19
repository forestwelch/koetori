// UI utilities for Phase 8

import { Category } from "../types/memo";

export function getCategoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    media: "bg-purple-500/10 text-purple-300 border-purple-500/40",
    event: "bg-blue-500/10 text-blue-300 border-blue-500/40",
    journal: "bg-green-500/10 text-green-300 border-green-500/40",
    therapy: "bg-pink-500/10 text-pink-300 border-pink-500/40",
    tarot: "bg-indigo-500/10 text-indigo-300 border-indigo-500/40",
    todo: "bg-orange-500/10 text-orange-300 border-orange-500/40",
    idea: "bg-yellow-500/10 text-yellow-300 border-yellow-500/40",
    other: "bg-gray-500/10 text-gray-300 border-gray-500/40",
  };
  return colors[category] || colors.other;
}

export function getCategoryGradient(category: Category): string {
  const gradients: Record<Category, string> = {
    media: "from-purple-500/50 to-pink-500/50",
    event: "from-blue-500/50 to-cyan-500/50",
    journal: "from-green-500/50 to-emerald-500/50",
    therapy: "from-pink-500/50 to-rose-500/50",
    tarot: "from-indigo-500/50 to-purple-500/50",
    todo: "from-orange-500/50 to-red-500/50",
    idea: "from-yellow-500/50 to-amber-500/50",
    other: "from-gray-500/50 to-slate-500/50",
  };
  return gradients[category] || gradients.other;
}

export function getCategoryIcon(category: Category): string {
  const icons: Record<Category, string> = {
    media: "🎬",
    event: "📅",
    journal: "📔",
    therapy: "💭",
    tarot: "🔮",
    todo: "✓",
    idea: "💡",
    other: "📝",
  };
  return icons[category] || icons.other;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
