/**
 * Garbage Detection for Memos
 *
 * Detects test recordings and truly garbage memos that should be auto-archived.
 * Uses multiple signals to avoid false positives.
 */

export interface GarbageDetectionResult {
  isGarbage: boolean;
  reason?: string;
}

const TEST_KEYWORDS = [
  "test",
  "testing",
  "just checking",
  "does this work",
  "can you hear me",
  "hello hello",
  "mic check",
  "is this on",
];

const VERY_SHORT_THRESHOLD_WORDS = 10;
const SHORT_THRESHOLD_WORDS = 20;
const SHORT_THRESHOLD_CHARS = 100;

export function detectGarbageMemo(
  transcript: string,
  category: string,
  confidence: number
): GarbageDetectionResult {
  const trimmedTranscript = transcript.trim();
  const wordCount = trimmedTranscript
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const charCount = trimmedTranscript.length;
  const lowerTranscript = trimmedTranscript.toLowerCase();

  // Signal 1: Very short transcripts (likely accidental recordings or tests)
  if (wordCount < VERY_SHORT_THRESHOLD_WORDS && charCount < 50) {
    return {
      isGarbage: true,
      reason: "Very short transcript (< 10 words, < 50 chars)",
    };
  }

  // Signal 2: Test keywords
  const containsTestKeyword = TEST_KEYWORDS.some((keyword) =>
    lowerTranscript.includes(keyword.toLowerCase())
  );

  // If it contains test keywords AND is short, definitely garbage
  if (
    containsTestKeyword &&
    (wordCount < SHORT_THRESHOLD_WORDS || charCount < SHORT_THRESHOLD_CHARS)
  ) {
    return {
      isGarbage: true,
      reason: "Contains test keywords and is short",
    };
  }

  // Signal 3: Very low confidence + category=other (algorithm has no clue)
  if (confidence < 0.3) {
    return {
      isGarbage: true,
      reason: "Very low confidence (< 0.3)",
    };
  }

  // Signal 4: Low confidence + category=other + short length
  if (
    category === "other" &&
    confidence < 0.5 &&
    (wordCount < SHORT_THRESHOLD_WORDS || charCount < SHORT_THRESHOLD_CHARS)
  ) {
    return {
      isGarbage: true,
      reason: "Low confidence + other category + short length",
    };
  }

  // Signal 5: Extremely short with test keywords (even if not super short)
  if (containsTestKeyword && wordCount < SHORT_THRESHOLD_WORDS * 2) {
    return {
      isGarbage: true,
      reason: "Contains test keywords and is short",
    };
  }

  // Not garbage
  return { isGarbage: false };
}
