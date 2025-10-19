// UI utilities for Phase 8

import { Category } from "../types/memo";

export function getCategoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    media: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    event: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    journal: "bg-green-500/20 text-green-400 border-green-500/30",
    therapy: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    tarot: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    todo: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    idea: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return colors[category] || colors.other;
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
