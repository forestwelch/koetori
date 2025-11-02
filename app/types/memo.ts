// Memo types for Phase 8: Smart Categorization

export type Category =
  | "media" // Movie/book/show/podcast recommendations
  | "event" // Calendar events, meetings, plans
  | "journal" // Personal thoughts/reflections
  | "therapy" // Therapy insights
  | "tarot" // Tarot readings
  | "todo" // Tasks/action items
  | "idea" // Ideas to explore
  | "to buy" // Shopping list, things to purchase
  | "other"; // Catch-all

export type TaskSize = "S" | "M" | "L" | null; // S: <5min, M: <30min, L: >30min

export interface ExtractedData {
  title?: string; // Main subject or item name (primarily for media items)
  who?: string[]; // People mentioned
  when?: string; // Date/time information
  where?: string; // Location mentioned
  what?: string; // Brief summary - main summary field
}

export type MemoSource = "app" | "device";
export type MemoInputType = "audio" | "text";

export interface Memo {
  id: string;
  transcript: string;
  transcription_id?: string; // Links to shared transcription (if split from multi-topic recording)
  transcript_excerpt?: string; // Relevant portion of transcript (if split from multi-topic recording)
  category: Category;
  confidence: number; // 0.0 - 1.0
  needs_review: boolean; // true if confidence < 0.7
  extracted: ExtractedData;
  tags: string[];
  timestamp: Date;
  deleted_at?: Date | null; // For soft delete
  starred?: boolean; // Starred/priority items
  size?: TaskSize; // T-shirt size for tasks (S: <5min, M: <30min, L: >30min)
  source: MemoSource; // Where the memo came from: app or device
  input_type: MemoInputType; // How it was captured: audio or text
  device_id?: string; // Device identifier (only for device sources)
}

export interface CategorizationResult {
  category: Category;
  confidence: number;
  extracted: ExtractedData;
  tags: string[];
  starred?: boolean; // Auto-star if urgent/important
  size?: TaskSize; // T-shirt size for tasks
  transcript_excerpt?: string; // Relevant portion of transcript (if split)
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
  size?: TaskSize; // T-shirt size for tasks
}
