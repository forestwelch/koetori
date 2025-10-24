import { Category } from "../types/memo";

export const categories: (Category | "all")[] = [
  "all",
  "media",
  "event",
  "journal",
  "therapy",
  "tarot",
  "todo",
  "idea",
  "to buy",
  "other",
];

// Centralized display labels - single source of truth
export const FILTER_LABELS = {
  // View filters
  VIEW_ALL: "All Memos",
  VIEW_STARRED: "Starred",
  VIEW_REVIEW: "Review",
  VIEW_ARCHIVE: "Archive",

  // Category filters
  CATEGORY_ALL: "All Types",
  CATEGORY_MEDIA: "Media",
  CATEGORY_EVENT: "Event",
  CATEGORY_JOURNAL: "Journal",
  CATEGORY_THERAPY: "Therapy",
  CATEGORY_TAROT: "Tarot",
  CATEGORY_TODO: "Do",
  CATEGORY_IDEA: "Idea",
  CATEGORY_TO_BUY: "Buy",
  CATEGORY_OTHER: "Other",

  // Size filters
  SIZE_ALL: "All Sizes",
  SIZE_S: "<5m",
  SIZE_M: "<30m",
  SIZE_L: ">30m",
} as const;

// Map database categories to display labels
export const getCategoryDisplayLabel = (category: Category): string => {
  const labelMap: Record<Category, string> = {
    media: FILTER_LABELS.CATEGORY_MEDIA,
    event: FILTER_LABELS.CATEGORY_EVENT,
    journal: FILTER_LABELS.CATEGORY_JOURNAL,
    therapy: FILTER_LABELS.CATEGORY_THERAPY,
    tarot: FILTER_LABELS.CATEGORY_TAROT,
    todo: FILTER_LABELS.CATEGORY_TODO,
    idea: FILTER_LABELS.CATEGORY_IDEA,
    "to buy": FILTER_LABELS.CATEGORY_TO_BUY,
    other: FILTER_LABELS.CATEGORY_OTHER,
  };
  return labelMap[category];
};
