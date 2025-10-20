// AI Categorization prompt and logic for Phase 8

import { Category, CategorizationResult, ExtractedData } from "../types/memo";

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
  "starred": false
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
    "what": "Movie recommendation, sounds great",
    "actionable": true
  },
  "tags": ["movie", "recommendation", "anime"]
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
    "what": "Discuss Max's book",
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
    "what": "Career reading - collaboration, community, team dinner connection",
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
    "what": "Buy groceries and schedule dentist appointment",
    "actionable": true
  },
  "tags": ["shopping", "groceries", "dentist", "errands"],
  "starred": false
}

Input: "Need to pick up milk, eggs, bread, and some coffee beans from the store"
Output:
{
  "category": "to buy",
  "confidence": 0.98,
  "extracted": {
    "what": "Groceries: milk, eggs, bread, coffee beans",
    "actionable": true
  },
  "tags": ["shopping", "groceries", "food"],
  "starred": false
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
  "starred": true
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
  };
}
