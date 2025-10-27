// AI Categorization prompt and logic for Phase 8

import { Category, CategorizationResult, ExtractedData } from "../types/memo";

// Type for split memo analysis
export interface SplitMemoResult {
  should_split: boolean;
  memos: CategorizationResult[];
}

export function buildCategorizationPrompt(transcript: string): string {
  return `You are a smart categorization assistant. Analyze this voice memo transcript and extract structured information.

CATEGORIES:
- media: Movie, book, TV show, podcast, music recommendations
- event: Calendar events, meetings, social plans
- journal: Personal reflections, daily thoughts
- therapy: Therapy session insights, mental health notes
- tarot: Tarot card readings and interpretations
- todo: Tasks, action items, things to do
- idea: Creative ideas, project concepts
- to buy: Shopping lists, items to purchase, things to buy
- other: Anything that doesn't fit above categories

INSTRUCTIONS:
1. Choose the BEST category (only one)
2. Provide confidence score (0.0 to 1.0)
3. Extract structured data (title, people, dates, locations, context)
4. Generate 2-5 relevant tags
5. Determine if this is actionable (needs follow-up)
6. Determine if this is URGENT/IMPORTANT/HIGH-PRIORITY (should be starred)
   - Star if user says: "important", "urgent", "priority", "critical", "star this", "top priority", "asap", "remember this", "don't forget"
   - Star if expressing high urgency or stress about something
   - Star if it's a time-sensitive task or deadline
   - Star if user explicitly requests emphasis
7. Estimate task SIZE (for actionable items only):
   - "S" (Small): Quick task, <5 minutes (e.g., send text, make call, buy one item, add song to playlist)
   - "M" (Medium): Moderate task, 5-60 minutes (e.g., write email, short meeting, small errand, read article, listen to podcast episode)
   - "L" (Large): Substantial task, >60 minutes (e.g., watch movie/show, read book, major project work, big shopping trip, attend long event)
   - null: Not an actionable task (journals, reflections, observations)
   
   SIZE GUIDELINES FOR MEDIA:
   - Movies, TV shows, books: "L" (they take hours)
   - Podcast episodes: "M" (typically 30-60 min)
   - Short videos, articles: "S" or "M" depending on length
   - Music tracks/albums: Consider if it's just adding to queue ("S") or actively listening ("M")

IMPORTANT: For the "what" field, create a SPECIFIC, ACTIONABLE summary that includes actual names/titles:
- For media: "Watch [Title]", "Read [Book]", "Listen to [Podcast]", etc.
- For events: "Meet [Person]", "[Event name] on [date]", etc. 
- For todos: "Order [specific item]", "Call [person/place]", etc.
- For shopping: Include specific item names, not just "groceries"
- Avoid generic phrases like "movie recommendation" - use the actual title
- Keep it concise but specific (under 50 characters when possible)

RESPONSE FORMAT (valid JSON only):
{
  "category": "category_name",
  "confidence": 0.95,
  "extracted": {
    "title": "main subject or item name",
    "who": ["person1", "person2"],
    "when": "any date/time mentioned",
    "where": "any location mentioned",
    "what": "brief one-sentence summary",
    "actionable": true
  },
  "tags": ["tag1", "tag2", "tag3"],
  "starred": false,
  "size": "M"
}

EXAMPLES:

Input: "My friend just recommended I watch Ghost in the Shell, sounds like a great movie!"
Output:
{
  "category": "media",
  "confidence": 0.98,
  "extracted": {
    "title": "Ghost in the Shell",
    "who": ["friend"],
    "what": "Watch Ghost in the Shell",
    "actionable": true
  },
  "tags": ["movie", "recommendation", "anime"],
  "size": "L"
}

Input: "Tomorrow Max said we could meet at Dandelion Chocolate at 6PM to discuss the book he's writing"
Output:
{
  "category": "event",
  "confidence": 0.95,
  "extracted": {
    "title": "Meet with Max",
    "who": ["Max"],
    "when": "tomorrow at 6pm",
    "where": "Dandelion Chocolate",
    "what": "Meet Max at Dandelion Chocolate",
    "actionable": true
  },
  "tags": ["meeting", "social", "book"]
}

Input: "I pulled the Three of Cups today for my career question. It made me think about collaboration and community, reminded me of the team dinner last week."
Output:
{
  "category": "tarot",
  "confidence": 0.92,
  "extracted": {
    "title": "Three of Cups",
    "what": "Three of Cups career reading",
    "actionable": false
  },
  "tags": ["tarot", "three-of-cups", "career", "collaboration"]
}

Input: "I need to remember to buy groceries tomorrow and also call the dentist to schedule a cleaning"
Output:
{
  "category": "todo",
  "confidence": 0.96,
  "extracted": {
    "what": "Buy groceries and call dentist",
    "actionable": true
  },
  "tags": ["shopping", "groceries", "dentist", "errands"],
  "starred": false,
  "size": "M"
}

Input: "Need to pick up milk, eggs, bread, and some coffee beans from the store"
Output:
{
  "category": "to buy",
  "confidence": 0.98,
  "extracted": {
    "what": "Milk, eggs, bread, coffee beans",
    "actionable": true
  },
  "tags": ["shopping", "groceries", "food"],
  "starred": false,
  "size": "M"
}

Input: "Reminder to watch Sleepy Hollow from 1999"
Output:
{
  "category": "media",
  "confidence": 0.95,
  "extracted": {
    "title": "Sleepy Hollow",
    "when": "1999",
    "what": "Watch Sleepy Hollow",
    "actionable": true
  },
  "tags": ["movie", "1999", "reminder"],
  "size": "L"
}

Input: "Check out Amy Pollard's podcast"
Output:
{
  "category": "media",
  "confidence": 0.92,
  "extracted": {
    "title": "Amy Pollard's podcast",
    "who": ["Amy Pollard"],
    "what": "Amy Pollard's podcast",
    "actionable": true
  },
  "tags": ["podcast", "recommendation"],
  "size": "M"
}

Input: "I gotta order the Murder on the Orient Express tickets, probably for this Friday"
Output:
{
  "category": "todo",
  "confidence": 0.94,
  "extracted": {
    "title": "Murder on the Orient Express tickets",
    "when": "Friday",
    "what": "Order Orient Express tickets",
    "actionable": true
  },
  "tags": ["tickets", "theater", "friday"],
  "starred": false,
  "size": "S"
}

Input: "Cadet Kelly is honestly such an iconic movie and I would love to watch it again"
Output:
{
  "category": "media",
  "confidence": 0.93,
  "extracted": {
    "title": "Cadet Kelly",
    "what": "Watch Cadet Kelly",
    "actionable": true
  },
  "tags": ["movie", "rewatch", "iconic"],
  "size": "L"
}

Input: "I gotta read the book, The Eyes are the Best Part"
Output:
{
  "category": "media",
  "confidence": 0.96,
  "extracted": {
    "title": "The Eyes are the Best Part",
    "what": "Read Eyes are the Best Part",
    "actionable": true
  },
  "tags": ["book", "reading"],
  "size": "L"
}

Input: "This is really important - I need to submit that grant application by Friday or we lose the funding. Top priority!"
Output:
{
  "category": "todo",
  "confidence": 0.98,
  "extracted": {
    "what": "Submit grant application by Friday",
    "when": "Friday",
    "actionable": true
  },
  "tags": ["urgent", "grant", "deadline", "funding"],
  "starred": true,
  "size": "L"
}

Input: "Today was tough, feeling overwhelmed with work deadlines but grateful for my supportive partner"
Output:
{
  "category": "journal",
  "confidence": 0.89,
  "extracted": {
    "what": "Feeling overwhelmed with work but grateful for partner's support",
    "actionable": false
  },
  "tags": ["reflection", "work-stress", "gratitude"]
}

Now analyze this transcript:
${transcript}

Respond with ONLY valid JSON, no other text.`;
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
- media: Movie, book, TV show, podcast, music recommendations
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
      "extracted": {
        "title": "main subject",
        "who": ["person1"],
        "when": "date/time",
        "where": "location",
        "what": "brief summary",
        "actionable": true
      },
      "tags": ["tag1", "tag2"],
      "starred": false,
      "size": "M"
    }
  ]
}

If should_split is false, still return ONE memo in the array.

Each memo should follow the same categorization rules as the single-memo prompt:
- Choose the BEST category
- Provide confidence (0.0-1.0)
- Extract structured data (title, people, dates, locations, what)
- Generate 2-5 relevant tags
- Star if urgent/important/priority
- Estimate size for actionable items (S/M/L)
- Keep "what" field specific and actionable

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

  // Validate size
  const validSizes = ["S", "M", "L"];
  const size =
    result.size && validSizes.includes(result.size as string)
      ? (result.size as "S" | "M" | "L")
      : null;

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
    size,
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
