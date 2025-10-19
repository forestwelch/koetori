// Memo types for Phase 8: Smart Categorization

export type Category =
  | "media" // Movie/book/show/podcast recommendations
  | "event" // Calendar events, meetings, plans
  | "journal" // Personal thoughts/reflections
  | "therapy" // Therapy insights
  | "tarot" // Tarot readings
  | "todo" // Tasks/action items
  | "idea" // Ideas to explore
  | "other"; // Catch-all

export interface ExtractedData {
  title?: string; // Main subject or item name
  who?: string[]; // People mentioned
  when?: string; // Date/time information
  where?: string; // Location mentioned
  what?: string; // Brief summary
  actionable?: boolean; // Requires follow-up action
}

export interface Memo {
  id: string;
  transcript: string;
  category: Category;
  confidence: number; // 0.0 - 1.0
  needs_review: boolean; // true if confidence < 0.7
  extracted: ExtractedData;
  tags: string[];
  timestamp: Date;
  deleted_at?: Date | null; // For soft delete
  starred?: boolean; // Starred/priority items
}

export interface CategorizationResult {
  category: Category;
  confidence: number;
  extracted: ExtractedData;
  tags: string[];
  starred?: boolean; // Auto-star if urgent/important
}

export interface TranscriptionResponse {
  transcript: string;
  category: Category;
  confidence: number;
  needs_review: boolean;
  extracted: ExtractedData;
  tags: string[];
  memo_id: string;
  starred?: boolean; // Auto-star if urgent/important
}
