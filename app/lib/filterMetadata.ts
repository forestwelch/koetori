import {
  Star,
  AlertCircle,
  Archive,
  Clock,
  Zap,
  Timer,
  Hourglass,
  Film,
  Calendar,
  BookOpen,
  Heart,
  Sparkles,
  CheckSquare,
  Lightbulb,
  ShoppingCart,
  FileQuestion,
  LayoutGrid,
  Grid3x3,
} from "lucide-react";
import { Category } from "../types/memo";

export interface FilterMetadata {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  searchTerms: string[];
}

// View filters metadata
export const VIEW_FILTERS: FilterMetadata[] = [
  {
    id: "all",
    label: "All",
    icon: LayoutGrid,
    colors: "from-indigo-500/30 via-indigo-400/20 to-purple-500/30",
    searchTerms: ["all", "memos", "everything"],
  },
  {
    id: "starred",
    label: "Starred",
    icon: Star,
    colors: "from-amber-500/30 via-amber-400/20 to-yellow-500/30",
    searchTerms: ["starred", "favorites", "star", "fav"],
  },
  {
    id: "review",
    label: "Review",
    icon: AlertCircle,
    colors: "from-fuchsia-500/30 via-fuchsia-400/20 to-pink-500/30",
    searchTerms: ["review", "needs review", "check", "rev"],
  },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    colors: "from-slate-500/30 via-slate-400/20 to-slate-600/30",
    searchTerms: ["archive", "archived", "arc"],
  },
];

// Category filters metadata
export const CATEGORY_FILTERS: Record<Category | "all", FilterMetadata> = {
  all: {
    id: "all",
    label: "All",
    icon: Grid3x3,
    colors: "from-slate-500/30 via-slate-400/20 to-slate-500/30",
    searchTerms: ["all", "types", "everything"],
  },
  media: {
    id: "media",
    label: "Media",
    icon: Film,
    colors: "from-emerald-500/30 via-emerald-400/20 to-green-500/30",
    searchTerms: ["media", "film", "movie", "show", "video"],
  },
  event: {
    id: "event",
    label: "Event",
    icon: Calendar,
    colors: "from-blue-500/30 via-blue-400/20 to-cyan-500/30",
    searchTerms: ["event", "calendar", "meeting", "appointment"],
  },
  journal: {
    id: "journal",
    label: "Journal",
    icon: BookOpen,
    colors: "from-purple-500/30 via-purple-400/20 to-fuchsia-500/30",
    searchTerms: ["journal", "diary", "writing", "log"],
  },
  therapy: {
    id: "therapy",
    label: "Therapy",
    icon: Heart,
    colors: "from-amber-500/30 via-amber-400/20 to-orange-500/30",
    searchTerms: ["therapy", "mental", "health", "feelings"],
  },
  tarot: {
    id: "tarot",
    label: "Tarot",
    icon: Sparkles,
    colors: "from-pink-500/30 via-pink-400/20 to-rose-500/30",
    searchTerms: ["tarot", "cards", "reading", "divination"],
  },
  todo: {
    id: "todo",
    label: "Do",
    icon: CheckSquare,
    colors: "from-indigo-500/30 via-indigo-400/20 to-blue-500/30",
    searchTerms: ["todo", "task", "do", "action"],
  },
  idea: {
    id: "idea",
    label: "Idea",
    icon: Lightbulb,
    colors: "from-cyan-500/30 via-cyan-400/20 to-teal-500/30",
    searchTerms: ["idea", "thought", "concept", "brainstorm"],
  },
  "to buy": {
    id: "to buy",
    label: "Buy",
    icon: ShoppingCart,
    colors: "from-rose-500/30 via-rose-400/20 to-pink-500/30",
    searchTerms: ["buy", "purchase", "shopping", "shop"],
  },
  other: {
    id: "other",
    label: "Other",
    icon: FileQuestion,
    colors: "from-slate-500/30 via-slate-400/20 to-slate-500/30",
    searchTerms: ["other", "misc", "miscellaneous"],
  },
};

// Size filters metadata
export const SIZE_FILTERS: FilterMetadata[] = [
  {
    id: "all",
    label: "All",
    icon: Clock,
    colors: "from-slate-500/30 via-slate-400/20 to-slate-500/30",
    searchTerms: ["all", "sizes", "any"],
  },
  {
    id: "S",
    label: "<5m",
    icon: Zap,
    colors: "from-emerald-500/30 via-emerald-400/20 to-green-500/30",
    searchTerms: ["quick", "small", "short", "s", "5", "<5m", "5m", "<5"],
  },
  {
    id: "M",
    label: "<30m",
    icon: Timer,
    colors: "from-blue-500/30 via-blue-400/20 to-cyan-500/30",
    searchTerms: ["medium", "m", "30", "<30m", "30m", "<30"],
  },
  {
    id: "L",
    label: ">30m",
    icon: Hourglass,
    colors: "from-purple-500/30 via-purple-400/20 to-fuchsia-500/30",
    searchTerms: ["long", "large", "l", "big", ">30m", ">30"],
  },
];

// Helper to get all category IDs in order
export const CATEGORY_ORDER: (Category | "all")[] = [
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
