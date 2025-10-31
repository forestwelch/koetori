import {
  EnrichmentTask,
  MediaEnrichmentPayload,
  ReminderEnrichmentPayload,
  ShoppingEnrichmentPayload,
} from "../pipeline/types";
import { sanitizeMediaTitle } from "../enrichment/mediaTitleUtils";

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

const MEDIA_CATEGORIES = new Set([
  "media",
  "movie",
  "tv",
  "music",
  "book",
  "reading",
  "novel",
]);
const MEDIA_KEYWORDS: Array<{
  keywords: string[];
  type: MediaEnrichmentPayload["probableMediaType"];
}> = [
  { keywords: ["movie", "film", "cinema"], type: "movie" },
  { keywords: ["show", "series", "tv"], type: "tv" },
  { keywords: ["album", "song", "music", "track", "podcast"], type: "music" },
  { keywords: ["game", "videogame", "play"], type: "game" },
  { keywords: ["book", "novel", "read", "reading"], type: "book" },
];
const REMINDER_CATEGORIES = new Set(["todo", "reminder", "event"]);
const SHOPPING_CATEGORIES = new Set(["to buy", "shopping", "purchase"]);
const SHOPPING_STOPWORDS = new Set([
  "some",
  "a",
  "an",
  "the",
  "of",
  "and",
  "need",
  "buy",
  "get",
  "to",
  "go",
  "grocery",
  "shopping",
  "store",
  "from",
  "at",
  "for",
  "just",
  "kind",
  "thing",
  "stuff",
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

    const inferredMediaType = inferMediaType(memo);
    const looksLikeMedia =
      MEDIA_CATEGORIES.has(normalizedCategory) ||
      inferredMediaType !== "unknown";

    if (looksLikeMedia) {
      // Filter out non-media items like museums, galleries, restaurants
      const allText = [
        memo.transcript_excerpt,
        inferStringField(memo.extracted, ["title", "name", "what", "where"]),
        ...(memo.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const nonMediaKeywords = [
        "museum",
        "gallery",
        "exhibition",
        "restaurant",
        "cafe",
        "location",
        "place to visit",
        "go to the",
        "visit the",
      ];

      if (nonMediaKeywords.some((keyword) => allText.includes(keyword))) {
        // Skip media enrichment for non-media locations
        continue;
      }

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
        probableMediaType: inferredMediaType,
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
      const extractedItems = extractShoppingItems(memo);

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
        items: extractedItems,
      };

      if (
        !shoppingPayload.itemNameGuess &&
        extractedItems &&
        extractedItems.length > 0
      ) {
        shoppingPayload.itemNameGuess = extractedItems[0];
      }

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

function extractShoppingItems(
  memo: PlannerInput["memos"][number]
): string[] | null {
  const collected = new Set<string>();

  const addItem = (value: string | null | undefined) => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    const words = trimmed
      .split(/\s+/)
      .filter((word) => !SHOPPING_STOPWORDS.has(word.toLowerCase()));
    const normalized = words.join(" ").trim();
    if (normalized.length === 0) return;
    collected.add(capitalize(normalized));
  };

  const extracted = memo.extracted;
  if (extracted) {
    if (Array.isArray((extracted as { items?: unknown }).items)) {
      for (const item of (extracted as { items?: unknown }).items as string[]) {
        addItem(item);
      }
    }
    if (typeof extracted.what === "string") {
      parseFromText(extracted.what, addItem);
    }
    if (typeof extracted.title === "string") {
      parseFromText(extracted.title, addItem);
    }
  }

  if (memo.transcript_excerpt) {
    parseFromText(memo.transcript_excerpt, addItem);
  }

  if (memo.tags) {
    for (const tag of memo.tags) {
      if (tag.length > 1) {
        addItem(tag);
      }
    }
  }

  const items = Array.from(collected).filter(Boolean);
  return items.length > 0 ? items : null;
}

function parseFromText(text: string, addItem: (value: string) => void) {
  const lowered = text.toLowerCase();
  const shoppingTriggers = [
    "buy",
    "purchase",
    "grab",
    "pick up",
    "need",
    "get",
  ];
  let working = lowered;
  for (const trigger of shoppingTriggers) {
    const idx = working.indexOf(trigger);
    if (idx !== -1) {
      working = working.slice(idx + trigger.length);
      break;
    }
  }

  working = working.replace(
    /\b(i\s+)?(need|wanna|want|have\s+to|gotta)\b/g,
    ""
  );

  const segments = working
    .split(/,|\band\b|\bor\b|\./)
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const cleaned = segment
      .replace(/^(to\s+)?get\s+/g, "")
      .replace(/^(to\s+)?buy\s+/g, "")
      .replace(/^(some\s+)?/g, "")
      .trim();
    if (!cleaned) continue;

    const words = cleaned.split(/\s+/);
    const filtered = words.filter(
      (word) => !SHOPPING_STOPWORDS.has(word.toLowerCase())
    );
    const phrase = filtered.join(" ").trim();
    if (phrase) {
      addItem(phrase);
    }
  }
}

function capitalize(value: string) {
  return value.replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

// sanitizeMediaTitle is now imported from ../enrichment/mediaTitleUtils
