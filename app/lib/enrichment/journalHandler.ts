import { JournalEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, JournalItemDraft } from "./types";

const DEFAULT_ENTRY = "Untitled journal entry";

export async function handleJournalTask(
  payload: JournalEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const entryText =
    payload.entryText ??
    extractFromPayload(payload, ["what", "summary", "entry"]) ??
    payload.transcriptExcerpt?.substring(0, 1000) ??
    DEFAULT_ENTRY;

  // Extract themes from tags or extracted data
  const themes = extractThemes(payload);

  // Try to infer mood from text
  const mood = inferMood(payload, entryText);

  const draft: JournalItemDraft = {
    entryText,
    themes: themes.length > 0 ? themes : null,
    mood,
  };

  return {
    status: "completed",
    type: "journal",
    draft,
    payload,
  };
}

function extractFromPayload(
  payload: JournalEnrichmentPayload,
  keys: string[]
): string | null {
  if (payload.extracted) {
    for (const key of keys) {
      const value = payload.extracted[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  return null;
}

function extractThemes(payload: JournalEnrichmentPayload): string[] {
  const themes: string[] = [];

  // Use tags as themes
  if (payload.tags && Array.isArray(payload.tags)) {
    themes.push(
      ...payload.tags.filter((tag): tag is string => typeof tag === "string")
    );
  }

  // Extract who/what/where as potential themes
  if (payload.extracted) {
    if (Array.isArray(payload.extracted.who)) {
      themes.push(
        ...payload.extracted.who.filter(
          (w): w is string => typeof w === "string"
        )
      );
    }
    if (typeof payload.extracted.where === "string") {
      themes.push(payload.extracted.where);
    }
  }

  // Deduplicate and return
  return Array.from(new Set(themes));
}

function inferMood(
  payload: JournalEnrichmentPayload,
  text: string
): string | null {
  const lowerText = text.toLowerCase();
  const allText = [
    lowerText,
    payload.transcriptExcerpt?.toLowerCase() || "",
    ...(payload.tags || []).map((tag) => tag.toLowerCase()),
  ].join(" ");

  // Mood keywords
  const moodPatterns: Record<string, string[]> = {
    happy: [
      "happy",
      "joy",
      "grateful",
      "excited",
      "elated",
      "content",
      "pleased",
    ],
    sad: ["sad", "down", "depressed", "unhappy", "melancholy", "blue"],
    anxious: ["anxious", "worried", "nervous", "stressed", "panic", "fear"],
    calm: ["calm", "peaceful", "relaxed", "serene", "tranquil", "centered"],
    frustrated: ["frustrated", "annoyed", "irritated", "upset", "angry"],
    grateful: ["grateful", "thankful", "appreciative", "blessed"],
    confused: ["confused", "uncertain", "unsure", "unclear", "puzzled"],
  };

  for (const [mood, keywords] of Object.entries(moodPatterns)) {
    if (keywords.some((keyword) => allText.includes(keyword))) {
      return mood;
    }
  }

  return null;
}
