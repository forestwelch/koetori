import { TarotEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, TarotItemDraft } from "./types";

// Common tarot card names
const TAROT_CARDS = [
  // Major Arcana
  "the fool",
  "the magician",
  "the high priestess",
  "the empress",
  "the emperor",
  "the hierophant",
  "the lovers",
  "the chariot",
  "strength",
  "the hermit",
  "wheel of fortune",
  "justice",
  "the hanged man",
  "death",
  "temperance",
  "the devil",
  "the tower",
  "the star",
  "the moon",
  "the sun",
  "judgement",
  "the world",
  // Suits
  "wands",
  "cups",
  "swords",
  "pentacles",
  // Numbers
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "page",
  "knight",
  "queen",
  "king",
];

export async function handleTarotTask(
  payload: TarotEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const cardName =
    payload.cardName ?? extractCardName(payload) ?? "Unknown Card";

  const parsed = parseCardName(cardName);
  const interpretation =
    payload.interpretation ??
    extractFromPayload(payload, ["what", "interpretation", "meaning"]) ??
    null;

  const readingContext =
    payload.readingContext ??
    extractFromPayload(payload, ["context", "about", "regarding"]) ??
    null;

  const draft: TarotItemDraft = {
    cardName: parsed.cardName,
    cardType: parsed.cardType,
    suit: parsed.suit,
    number: parsed.number,
    interpretation,
    readingContext,
  };

  return {
    status: "completed",
    type: "tarot",
    draft,
    payload,
  };
}

function extractCardName(payload: TarotEnrichmentPayload): string | null {
  // Check extracted title first
  if (payload.extracted?.title && typeof payload.extracted.title === "string") {
    const title = payload.extracted.title.trim();
    if (containsTarotCard(title)) {
      return title;
    }
  }

  // Check transcript excerpt
  if (payload.transcriptExcerpt) {
    const cardMatch = findTarotCard(payload.transcriptExcerpt);
    if (cardMatch) return cardMatch;
  }

  // Check what field
  if (payload.extracted?.what && typeof payload.extracted.what === "string") {
    const cardMatch = findTarotCard(payload.extracted.what);
    if (cardMatch) return cardMatch;
  }

  // Check tags
  if (payload.tags) {
    for (const tag of payload.tags) {
      if (typeof tag === "string" && containsTarotCard(tag)) {
        return tag;
      }
    }
  }

  return null;
}

function containsTarotCard(text: string): boolean {
  const lower = text.toLowerCase();
  return TAROT_CARDS.some((card) => lower.includes(card));
}

function findTarotCard(text: string): string | null {
  const lower = text.toLowerCase();

  // Try to find full card names first (e.g., "ten of pentacles")
  const fullPattern = /(\w+\s+of\s+\w+)/i;
  const fullMatch = text.match(fullPattern);
  if (fullMatch && containsTarotCard(fullMatch[1])) {
    return fullMatch[1];
  }

  // Try to find "The [Card Name]" pattern
  const thePattern = /(the\s+\w+)/i;
  const theMatch = text.match(thePattern);
  if (theMatch && containsTarotCard(theMatch[1])) {
    return theMatch[1];
  }

  // Check for individual card mentions
  for (const card of TAROT_CARDS) {
    if (lower.includes(card)) {
      // Try to reconstruct full name
      if (card.includes("of")) {
        return card;
      }
      if (card === "the fool" || card.startsWith("the ")) {
        return card;
      }
      // For suit cards, try to find the full "X of Y" pattern nearby
      const contextMatch = text.match(
        new RegExp(`(\\w+\\s+of\\s+${card})`, "i")
      );
      if (contextMatch) {
        return contextMatch[1];
      }
    }
  }

  return null;
}

function parseCardName(cardName: string): {
  cardName: string;
  cardType: "major_arcana" | "minor_arcana" | null;
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  number: string | null;
} {
  const lower = cardName.toLowerCase().trim();

  // Major arcana detection
  const majorArcana = [
    "the fool",
    "the magician",
    "the high priestess",
    "the empress",
    "the emperor",
    "the hierophant",
    "the lovers",
    "the chariot",
    "strength",
    "the hermit",
    "wheel of fortune",
    "justice",
    "the hanged man",
    "death",
    "temperance",
    "the devil",
    "the tower",
    "the star",
    "the moon",
    "the sun",
    "judgement",
    "the world",
  ];

  if (majorArcana.some((card) => lower.includes(card))) {
    return {
      cardName,
      cardType: "major_arcana",
      suit: null,
      number: null,
    };
  }

  // Minor arcana - parse "X of Y" pattern
  const minorMatch = lower.match(/(\w+)\s+of\s+(wands|cups|swords|pentacles)/);
  if (minorMatch) {
    return {
      cardName,
      cardType: "minor_arcana",
      suit: minorMatch[2] as "wands" | "cups" | "swords" | "pentacles",
      number: minorMatch[1],
    };
  }

  return {
    cardName,
    cardType: null,
    suit: null,
    number: null,
  };
}

function extractFromPayload(
  payload: TarotEnrichmentPayload,
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
