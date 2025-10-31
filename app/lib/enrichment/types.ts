import {
  MediaEnrichmentPayload,
  ReminderEnrichmentPayload,
  ShoppingEnrichmentPayload,
  EnrichmentTask,
} from "../pipeline/types";

export type EnrichmentHandlerInput = EnrichmentTask;

export interface MediaItemDraft {
  title: string;
  releaseYear?: number | null;
  runtimeMinutes?: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview?: string | null;
  trailerUrl?: string | null;
  platforms?: string[];
  providers?: string[];
  genres?: string[];
  tmdbId?: string | null;
  imdbId?: string | null;
  mediaType?: "movie" | "tv" | "music" | "game" | "book" | "unknown";
  ratings?: Array<{ source: string; value: string }>;
  autoTitle?: string | null;
  autoReleaseYear?: number | null;
  searchDebug?: Record<string, unknown> | null;
}

export interface ReminderDraft {
  title: string;
  dueDateText?: string | null;
  recurrenceText?: string | null;
  priorityScore?: number | null;
  recurrenceHint?: boolean;
}

export interface ShoppingListItemDraft {
  itemName: string;
  quantity?: string | null;
  category?: string | null;
  urgencyScore?: number | null;
  items?: string[] | null;
}

export interface EnrichmentJobContext {
  media?: MediaEnrichmentPayload;
  reminder?: ReminderEnrichmentPayload;
  shopping?: ShoppingEnrichmentPayload;
}

export type EnrichmentJobResult =
  | {
      status: "completed";
      type: "media";
      draft: MediaItemDraft;
      payload: MediaEnrichmentPayload;
    }
  | {
      status: "completed";
      type: "reminder";
      draft: ReminderDraft;
      payload: ReminderEnrichmentPayload;
    }
  | {
      status: "completed";
      type: "shopping";
      draft: ShoppingListItemDraft;
      payload: ShoppingEnrichmentPayload;
    }
  | {
      status: "skipped";
      type: EnrichmentTask["type"];
      reason: string;
    };

export interface EnrichmentHandler {
  (task: EnrichmentHandlerInput): Promise<EnrichmentJobResult>;
}
