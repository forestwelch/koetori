export interface MediaItem {
  memoId: string;
  title: string;
  releaseYear: number | null;
  runtimeMinutes: number | null;
  posterUrl: string | null;
  overview: string | null;
  trailerUrl: string | null;
  platforms: string[] | null;
  ratings: Array<{ source: string; value: string }> | null;
  transcriptExcerpt: string | null;
  tags: string[];
  updatedAt: Date;
}

export interface ReminderItem {
  memoId: string;
  title: string;
  dueDateText: string | null;
  recurrenceText: string | null;
  priorityScore: number | null;
  status: string;
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
  updatedAt: Date;
}
