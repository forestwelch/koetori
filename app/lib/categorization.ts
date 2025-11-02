// AI Categorization prompt and logic for Phase 8

import { Category, CategorizationResult, ExtractedData } from "../types/memo";

// Type for split memo analysis
export interface SplitMemoResult {
  should_split: boolean;
  memos: CategorizationResult[];
}

export function buildSplittingPrompt(transcript: string): string {
  return `You are an intelligent memo splitting assistant. Analyze this voice memo transcript and determine if it contains multiple distinct topics that should be split into separate memos.

SPLITTING PRINCIPLES:
1. **Theme-based grouping**: Group related items by theme (shopping, person-focused tasks, event prep)
2. **Split unrelated topics**: Even short items should be separate if they're truly unrelated
3. **Events are special**: Events get their own memo, separate from prep tasks
4. **Preserve context**: Detailed thoughts (therapy, journal) stay together
5. **Single coherent topic**: If the whole transcript is about one thing, DON'T split it

SPLITTING EXAMPLES:

Example 1 - SPLIT (Multiple unrelated tasks):
Input: "I need to text Sarah. Also need to buy milk."
Output: 2 memos (Sarah ≠ milk, completely unrelated)

Example 2 - DON'T SPLIT (Related shopping):
Input: "I need eggs, milk, chicken, onions, and carrots. Making soup because I'm sick. Also need cold medicine."
Output: 1 memo (all shopping-related, soup context ties it together)

Example 3 - SPLIT (Multiple people with different context):
Input: "Need to message Chico and Thomas about the party. Also call Armin - he's been really flaky, took two weeks to respond and I'm questioning the friendship."
Output: 2 memos 
  - Memo 1: "Message Chico and Thomas about party"
  - Memo 2: "Call Armin" (includes detailed relationship context)

Example 4 - SPLIT (Todo + Journal reflection):
Input: "I need to make soup today. Honestly feeling really under the weather emotionally and physically. Hard to describe but I feel off. Anyway the soup will help."
Output: 2 memos
  - Memo 1: "Make soup" (todo)
  - Memo 2: "Feeling under the weather emotionally" (journal)

Example 5 - SPLIT (Tarot + embedded action):
Input: "Drew 9 of Pentacles today about enjoying fruits of labor. Reminds me I should take a break this weekend. Also need to text Sarah about brunch Sunday."
Output: 2 memos
  - Memo 1: "9 of Pentacles reading - take a break" (tarot + related reflection)
  - Memo 2: "Text Sarah about brunch Sunday" (distinct action)

Example 6 - SPLIT (Event + prep tasks):
Input: "Thanksgiving next week at Mom's house. Need to bring dessert, text her to confirm time, and pick up wine."
Output: 2 memos
  - Memo 1: "Thanksgiving at Mom's house next week" (event)
  - Memo 2: "Thanksgiving prep: dessert, text mom, wine" (related tasks)

Example 7 - DON'T SPLIT (Single person/theme):
Input: "What was that restaurant Thomas recommended? Need to look that up. Should probably figure out if he's free next week for dinner too."
Output: 1 memo (all Thomas-related plans)

CATEGORIES:
- media: Movie, book, TV show, podcast, music recommendations (NOT museums, galleries, exhibitions, restaurants, or other physical locations)
- event: Calendar events, meetings, social plans
- journal: Personal reflections, daily thoughts
- therapy: Therapy session insights, mental health notes
- tarot: Tarot card readings and interpretations
- todo: Tasks, action items, things to do
- idea: Creative ideas, project concepts
- to buy: Shopping lists, items to purchase
- other: Anything that doesn't fit above categories

RESPONSE FORMAT (valid JSON only):
{
  "should_split": true,
  "memos": [
    {
      "category": "category_name",
      "confidence": 0.95,
      "transcript_excerpt": "The relevant portion of the transcript that relates to this specific memo (the actual words from the recording)",
      "extracted": {
        "title": "main subject (for media items, extract ONLY the title name without action verbs like 'watch', 'play', 'read', e.g., 'Ghost in the Shell' not 'watch Ghost in the Shell')",
        "who": ["person1"],
        "when": "date/time",
        "where": "location",
        "what": "brief summary"
      },
      "tags": ["tag1", "tag2"],
      "starred": false
    }
  ]
}

IMPORTANT: For transcript_excerpt, extract the EXACT relevant words from the transcript that relate to this memo. This helps users see which part of their recording this memo came from.

If should_split is false, still return ONE memo in the array.

Each memo should follow the same categorization rules as the single-memo prompt:
- Choose the BEST category
- Provide confidence (0.0-1.0)
- Extract structured data (title, people, dates, locations, what)
- For media items: Extract ONLY the media title in the "title" field, WITHOUT action verbs (e.g., "Ghost in the Shell" not "watch Ghost in the Shell", "INSIDE" not "play INSIDE again")
- Detect action verbs to infer media type: "play" suggests a game, "watch" suggests movie/TV, "read" suggests a book
- Do NOT categorize physical locations (museums, galleries, restaurants) as "media" - use "todo" or "event" instead
- Generate 2-5 relevant tags
- Star if urgent/important/priority
- Keep "what" field specific and concise

Now analyze this transcript and determine if it should be split:
${transcript}

Respond with ONLY valid JSON, no other text.`;
}

export function validateCategorizationResult(
  result: Record<string, unknown>
): CategorizationResult {
  // Validate category
  const validCategories: Category[] = [
    "media",
    "event",
    "journal",
    "therapy",
    "tarot",
    "todo",
    "idea",
    "to buy",
    "other",
  ];

  let category = result.category as Category;
  if (!validCategories.includes(category)) {
    category = "other";
  }

  // Ensure confidence is between 0 and 1
  let confidence =
    typeof result.confidence === "number" ? result.confidence : 0.5;
  confidence = Math.max(0, Math.min(1, confidence));

  // Ensure extracted data exists
  const extracted = (result.extracted as ExtractedData) || {};

  // Ensure tags is an array
  const tags = Array.isArray(result.tags) ? result.tags : [];

  // Check if starred
  const starred = typeof result.starred === "boolean" ? result.starred : false;

  // Extract transcript excerpt if present
  const transcript_excerpt =
    typeof result.transcript_excerpt === "string"
      ? result.transcript_excerpt
      : undefined;

  // Ensure who is an array if present
  if (extracted.who && !Array.isArray(extracted.who)) {
    extracted.who = [extracted.who as unknown as string];
  }

  return {
    category,
    confidence,
    extracted,
    tags,
    starred,
    transcript_excerpt,
  };
}

export function validateSplitResult(
  result: Record<string, unknown>
): SplitMemoResult {
  const should_split =
    typeof result.should_split === "boolean" ? result.should_split : false;

  const memosArray = Array.isArray(result.memos) ? result.memos : [result];

  const validatedMemos = memosArray.map((memo) =>
    validateCategorizationResult(memo as Record<string, unknown>)
  );

  return {
    should_split,
    memos: validatedMemos,
  };
}
