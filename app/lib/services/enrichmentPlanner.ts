import {
  EnrichmentTask,
  MediaEnrichmentPayload,
  ReminderEnrichmentPayload,
  ShoppingEnrichmentPayload,
} from "../pipeline/types";

interface PlannerInput {
  memos: Array<{
    id: string;
    category: string;
    extracted: Record<string, unknown> | null;
    tags: string[] | null;
    transcript_excerpt: string | null;
    is_archived?: boolean;
    archived?: boolean;
    deleted_at?: string | null;
  }>;
  metadata: {
    username: string;
    source: string;
  };
  transcriptionId: string;
}

const MEDIA_CATEGORIES = new Set(["media", "movie", "tv", "music"]);
const MEDIA_KEYWORDS: Array<{
  keywords: string[];
  type: MediaEnrichmentPayload["probableMediaType"];
}> = [
  { keywords: ["movie", "film", "cinema"], type: "movie" },
  { keywords: ["show", "series", "tv"], type: "tv" },
  { keywords: ["album", "song", "music", "track", "podcast"], type: "music" },
  { keywords: ["game", "videogame", "play"], type: "game" },
];
const REMINDER_CATEGORIES = new Set(["todo", "reminder", "event"]);
const SHOPPING_CATEGORIES = new Set(["to buy", "shopping", "purchase"]);
const MEDIA_TITLE_BLOCKLIST = new Set([
  "youtube",
  "spotify",
  "soundcloud",
  "link",
  "watch",
]);

export function planEnrichmentTasks(input: PlannerInput): EnrichmentTask[] {
  const tasks: EnrichmentTask[] = [];

  for (const memo of input.memos) {
    if (memo.is_archived || memo.archived || memo.deleted_at) {
      continue;
    }

    const normalizedCategory = memo.category.toLowerCase();
    const basePayload = {
      transcriptionId: input.transcriptionId,
      username: input.metadata.username,
      memoId: memo.id,
      memoCategory: memo.category,
      tags: memo.tags,
      extracted: memo.extracted,
      transcriptExcerpt: memo.transcript_excerpt,
    };

    if (MEDIA_CATEGORIES.has(normalizedCategory)) {
      const probableTitle = deriveMediaTitle(memo);
      if (!probableTitle) {
        continue;
      }

      const mediaPayload: MediaEnrichmentPayload = {
        ...basePayload,
        probableTitle,
        probableYear: inferNumberField(memo.extracted, [
          "year",
          "release_year",
        ]),
        rawTextHints: buildHints(
          memo.extracted,
          memo.tags,
          memo.transcript_excerpt
        ),
        probableMediaType: inferMediaType(memo),
      };

      tasks.push({
        type: "media",
        payload: mediaPayload,
      });
      continue;
    }

    if (REMINDER_CATEGORIES.has(normalizedCategory)) {
      const reminderPayload: ReminderEnrichmentPayload = {
        ...basePayload,
        reminderText: inferStringField(memo.extracted, [
          "what",
          "reminder",
          "action",
        ]),
        dueDateText: inferStringField(memo.extracted, [
          "when",
          "due",
          "deadline",
        ]),
        recurrenceText: inferStringField(memo.extracted, [
          "repeat",
          "frequency",
          "schedule",
        ]),
        priorityScore: inferNumberField(memo.extracted, [
          "priority",
          "urgency",
        ]),
        recurrenceHint: detectRecurringIntent(memo),
      };

      tasks.push({
        type: "reminder",
        payload: reminderPayload,
      });
      continue;
    }

    if (SHOPPING_CATEGORIES.has(normalizedCategory)) {
      const shoppingPayload: ShoppingEnrichmentPayload = {
        ...basePayload,
        itemNameGuess: inferStringField(memo.extracted, [
          "item",
          "product",
          "thing",
          "title",
        ]),
        quantityGuess: inferStringField(memo.extracted, [
          "quantity",
          "amount",
          "count",
        ]),
        categoryGuess: inferStringField(memo.extracted, [
          "category",
          "type",
          "genre",
        ]),
        urgencyScore: inferNumberField(
          memo.extracted,
          ["urgency", "priority", "soon"],
          0
        ),
      };

      tasks.push({
        type: "shopping",
        payload: shoppingPayload,
      });
    }
  }

  return tasks;
}

function inferStringField(
  extracted: Record<string, unknown> | null,
  keys: string[]
): string | null {
  if (!extracted) return null;
  for (const key of keys) {
    const value = extracted[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function inferNumberField(
  extracted: Record<string, unknown> | null,
  keys: string[],
  fallback: number | null = null
): number | null {
  if (!extracted) return fallback;
  for (const key of keys) {
    const value = extracted[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return fallback;
}

function collectTextHints(
  extracted: Record<string, unknown> | null
): string[] | undefined {
  if (!extracted) return undefined;
  const hints: string[] = [];

  for (const value of Object.values(extracted)) {
    if (typeof value === "string" && value.trim()) {
      hints.push(value.trim());
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim()) {
          hints.push(item.trim());
        }
      }
    }
  }

  return hints.length > 0 ? hints.slice(0, 6) : undefined;
}

function buildHints(
  extracted: Record<string, unknown> | null,
  tags: string[] | null,
  transcriptExcerpt: string | null
): string[] | undefined {
  const hints = collectTextHints(extracted) ?? [];

  if (tags) {
    for (const tag of tags) {
      if (typeof tag === "string" && tag.trim()) {
        hints.push(tag.trim());
      }
    }
  }

  if (transcriptExcerpt && transcriptExcerpt.trim()) {
    hints.push(transcriptExcerpt.trim());
  }

  return hints.length > 0 ? hints.slice(0, 6) : undefined;
}

function deriveMediaTitle(memo: PlannerInput["memos"][number]): string | null {
  const candidates: Array<string | null> = [
    inferStringField(memo.extracted, ["title", "name", "what"]),
  ];

  if (memo.tags && memo.tags.length > 0) {
    candidates.push(...memo.tags);
  }

  if (memo.transcript_excerpt) {
    candidates.push(memo.transcript_excerpt);
  }

  for (const candidate of candidates) {
    const sanitized = sanitizeMediaTitle(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  return null;
}

function inferMediaType(
  memo: PlannerInput["memos"][number]
): MediaEnrichmentPayload["probableMediaType"] {
  const haystacks: string[] = [];
  if (memo.tags) {
    haystacks.push(...memo.tags.map((tag) => tag.toLowerCase()));
  }
  if (memo.transcript_excerpt) {
    haystacks.push(memo.transcript_excerpt.toLowerCase());
  }
  if (memo.extracted) {
    for (const value of Object.values(memo.extracted)) {
      if (typeof value === "string") {
        haystacks.push(value.toLowerCase());
      }
    }
  }

  for (const { keywords, type } of MEDIA_KEYWORDS) {
    if (
      haystacks.some((text) =>
        keywords.some((keyword) => text.includes(keyword))
      )
    ) {
      return type;
    }
  }

  return "unknown";
}

function detectRecurringIntent(memo: PlannerInput["memos"][number]): boolean {
  const recurrenceKeywords = [
    "every",
    "each",
    "daily",
    "weekly",
    "monthly",
    "habit",
    "again",
    "reminder",
    "routine",
  ];

  const sources: string[] = [];
  if (memo.tags) sources.push(...memo.tags.map((tag) => tag.toLowerCase()));
  if (memo.transcript_excerpt)
    sources.push(memo.transcript_excerpt.toLowerCase());
  if (memo.extracted) {
    for (const value of Object.values(memo.extracted)) {
      if (typeof value === "string") {
        sources.push(value.toLowerCase());
      }
    }
  }

  return sources.some((text) =>
    recurrenceKeywords.some((keyword) => text.includes(keyword))
  );
}

function sanitizeMediaTitle(title: string | null | undefined): string | null {
  if (!title) return null;
  const trimmed = title.trim();
  if (trimmed.length < 3) return null;

  const normalized = trimmed.toLowerCase();
  if (MEDIA_TITLE_BLOCKLIST.has(normalized)) return null;
  if (/https?:\/\//.test(normalized)) return null;

  return trimmed;
}
