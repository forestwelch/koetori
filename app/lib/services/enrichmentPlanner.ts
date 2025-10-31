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
  }>;
  metadata: {
    username: string;
    source: string;
  };
  transcriptionId: string;
}

const MEDIA_CATEGORIES = new Set(["media", "movie", "tv", "music"]);
const REMINDER_CATEGORIES = new Set(["todo", "reminder", "event"]);
const SHOPPING_CATEGORIES = new Set(["to buy", "shopping", "purchase"]);

export function planEnrichmentTasks(input: PlannerInput): EnrichmentTask[] {
  const tasks: EnrichmentTask[] = [];

  for (const memo of input.memos) {
    const normalizedCategory = memo.category.toLowerCase();
    const basePayload = {
      transcriptionId: input.transcriptionId,
      username: input.metadata.username,
      memoId: memo.id,
      memoCategory: memo.category,
      tags: memo.tags,
      extracted: memo.extracted,
      transcriptExcerpt: memo.transcript_excerpt,
    } satisfies MediaEnrichmentPayload;

    if (MEDIA_CATEGORIES.has(normalizedCategory)) {
      const mediaPayload: MediaEnrichmentPayload = {
        ...basePayload,
        probableTitle: inferStringField(memo.extracted, ["title", "name"]),
        probableYear: inferNumberField(memo.extracted, [
          "year",
          "release_year",
        ]),
        rawTextHints: collectTextHints(memo.extracted),
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
