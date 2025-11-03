export type MediaStatus = "to-watch" | "watched" | "backlog";

export interface MediaItem {
  memoId: string;
  title: string;
  releaseYear: number | null;
  runtimeMinutes: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  trailerUrl: string | null;
  platforms: string[] | null;
  providers: string[] | null;
  genres: string[] | null;
  tmdbId: string | null;
  imdbId: string | null;
  mediaType: "movie" | "tv" | "music" | "game" | "book" | "unknown" | null;
  ratings: Array<{ source: string; value: string }> | null;
  transcriptExcerpt: string | null;
  tags: string[];
  autoTitle: string | null;
  customTitle: string | null;
  autoReleaseYear: number | null;
  customReleaseYear: number | null;
  searchDebug: Record<string, unknown> | null;
  source: "tmdb" | "igdb" | "omdb" | "manual" | null;
  externalUrl: string | null;
  timeToBeatMinutes: number | null;
  status: MediaStatus;
  updatedAt: Date;
}

export interface ReminderItem {
  memoId: string;
  title: string;
  dueDateText: string | null;
  recurrenceText: string | null;
  priorityScore: number | null;
  status: string;
  isRecurring: boolean;
  dueAt: string | null;
  recurrenceRule: string | null;
  transcriptExcerpt: string | null;
  updatedAt: Date;
}

export interface ShoppingListItem {
  memoId: string;
  itemName: string;
  quantity: string | null;
  category: string | null;
  urgencyScore: number | null;
  status: string;
  transcriptExcerpt: string | null;
  items: string[];
  displayOrder: number;
  updatedAt: Date;
}

export interface JournalItem {
  memoId: string;
  entryText: string;
  themes: string[] | null;
  mood: string | null;
  transcriptExcerpt: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TarotItem {
  memoId: string;
  cardName: string;
  cardType: "major_arcana" | "minor_arcana" | null;
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  number: string | null;
  interpretation: string | null;
  readingContext: string | null;
  transcriptExcerpt: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type IdeaStatus =
  | "new"
  | "exploring"
  | "planning"
  | "on-hold"
  | "archived";

export interface IdeaItem {
  memoId: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  status: IdeaStatus;
  transcriptExcerpt: string | null;
  createdAt: Date;
  updatedAt: Date;
}
