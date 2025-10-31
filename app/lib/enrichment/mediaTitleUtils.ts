/**
 * Shared utilities for media title sanitization and validation
 */

/**
 * Terms that should be blocked from being treated as media titles
 */
export const MEDIA_TITLE_BLOCKLIST = new Set([
  "youtube",
  "spotify",
  "soundcloud",
  "link",
  "watch",
  "museum",
  "gallery",
  "exhibition",
  "location",
  "place",
  "restaurant",
  "cafe",
]);

/**
 * Action verb pattern to strip from the start of titles
 * Handles phrases like "I should watch", "Dude you gotta play", etc.
 */
const ACTION_VERB_PATTERN =
  /^(i\s+)?(should\s+)?(gotta\s+)?(you\s+)?(dude\s+)?(watch|play|read|listen\s+to|see|go\s+to|visit|check\s+out|try)\s+/i;

/**
 * Trailing phrase pattern to remove from the end of titles
 */
const TRAILING_PHRASE_PATTERN = /\s+(again|too|as\s+well|sometime)$/i;

/**
 * Sanitizes a media title by:
 * 1. Stripping action verbs (watch, play, read, etc.)
 * 2. Removing trailing phrases (again, too, as well)
 * 3. Blocking known non-media terms
 * 4. Validating minimum length
 *
 * Examples:
 * - "watch Ghost in the Shell" → "Ghost in the Shell"
 * - "play INSIDE again" → "INSIDE"
 * - "Dude you gotta watch ghost in the shell" → "Ghost in the Shell"
 * - "museum" → null (blocked)
 */
export function sanitizeMediaTitle(
  title: string | null | undefined
): string | null {
  if (!title) return null;
  let trimmed = title.trim();
  if (trimmed.length < 3) return null;

  const normalized = trimmed.toLowerCase();
  if (MEDIA_TITLE_BLOCKLIST.has(normalized)) return null;
  if (/https?:\/\//.test(normalized)) return null;

  // Strip common action verbs from the start of the title
  trimmed = trimmed.replace(ACTION_VERB_PATTERN, "").trim();

  // Also remove trailing phrases like "again", "too", "as well"
  trimmed = trimmed.replace(TRAILING_PHRASE_PATTERN, "").trim();

  if (trimmed.length < 3) return null;

  // Check if it still matches blocklist after cleaning
  const cleanedNormalized = trimmed.toLowerCase();
  if (MEDIA_TITLE_BLOCKLIST.has(cleanedNormalized)) return null;

  return trimmed;
}
