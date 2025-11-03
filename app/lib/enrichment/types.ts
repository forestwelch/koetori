import {
  MediaEnrichmentPayload,
  ReminderEnrichmentPayload,
  ShoppingEnrichmentPayload,
  TodoEnrichmentPayload,
  JournalEnrichmentPayload,
  TarotEnrichmentPayload,
  IdeaEnrichmentPayload,
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
  customTitle?: string | null;
  autoReleaseYear?: number | null;
  customReleaseYear?: number | null;
  searchDebug?: Record<string, unknown> | null;
  source?: "tmdb" | "igdb" | "omdb" | "manual";
  externalUrl?: string | null;
  timeToBeatMinutes?: number | null;
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

export interface TodoItemDraft {
  summary: string;
  size?: "S" | "M" | "L" | null;
}

export interface JournalItemDraft {
  entryText: string;
  themes?: string[] | null;
  mood?: string | null;
}

export interface TarotItemDraft {
  cardName: string;
  cardType?: "major_arcana" | "minor_arcana" | null;
  suit?: "wands" | "cups" | "swords" | "pentacles" | null;
  number?: string | null;
  interpretation?: string | null;
  readingContext?: string | null;
}

export interface IdeaItemDraft {
  title: string;
  description?: string | null;
  category?: string | null;
  tags?: string[] | null;
}

export interface EnrichmentJobContext {
  media?: MediaEnrichmentPayload;
  reminder?: ReminderEnrichmentPayload;
  shopping?: ShoppingEnrichmentPayload;
  todo?: TodoEnrichmentPayload;
  journal?: JournalEnrichmentPayload;
  tarot?: TarotEnrichmentPayload;
  idea?: IdeaEnrichmentPayload;
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
      status: "completed";
      type: "todo";
      draft: TodoItemDraft;
      payload: TodoEnrichmentPayload;
    }
  | {
      status: "completed";
      type: "journal";
      draft: JournalItemDraft;
      payload: JournalEnrichmentPayload;
    }
  | {
      status: "completed";
      type: "tarot";
      draft: TarotItemDraft;
      payload: TarotEnrichmentPayload;
    }
  | {
      status: "completed";
      type: "idea";
      draft: IdeaItemDraft;
      payload: IdeaEnrichmentPayload;
    }
  | {
      status: "skipped";
      type: EnrichmentTask["type"];
      reason: string;
    };

export interface EnrichmentHandler {
  (task: EnrichmentHandlerInput): Promise<EnrichmentJobResult>;
}
