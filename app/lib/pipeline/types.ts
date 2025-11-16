export type CaptureInputType = "audio" | "text" | "image";

export type CaptureSource = "app" | "device" | "web" | "import";

export interface CaptureMetadata {
  username: string;
  source: CaptureSource;
  deviceId?: string | null;
  inputType: CaptureInputType;
  clientId?: string;
  requestId?: string;
}

export interface CaptureRequest {
  metadata: CaptureMetadata;
  transcript?: string;
  audioFile?: Blob;
  imageFile?: Blob;
  originalFilename?: string;
  contentType?: string | null;
}

export interface CaptureReceipt {
  normalizedUsername: string;
  requestId: string;
  receivedAt: Date;
}

export interface TranscriptionJob {
  request: CaptureRequest;
}

export interface TranscriptionResult {
  transcript: string;
  language?: string;
  durationSeconds?: number | null;
  provider?: string;
}

export interface UnderstandingMemo {
  transcriptExcerpt?: string | null;
  category: string;
  confidence: number;
  needsReview?: boolean;
  extracted?: Record<string, unknown> | null;
  tags?: string[] | null;
  starred?: boolean;
}

export interface UnderstandingTask {
  transcript: string;
  memoCountHint?: number;
}

export interface UnderstandingResult {
  shouldSplit: boolean;
  memos: UnderstandingMemo[];
  raw?: unknown;
}

export type EnrichmentTaskType =
  | "media"
  | "reminder"
  | "shopping"
  | "todo"
  | "journal"
  | "tarot"
  | "idea";

export interface BaseEnrichmentPayload {
  transcriptionId: string;
  username: string;
  memoId: string;
  memoCategory: string;
  tags?: string[] | null;
  extracted?: Record<string, unknown> | null;
  transcriptExcerpt?: string | null;
}

export interface MediaEnrichmentPayload extends BaseEnrichmentPayload {
  probableTitle?: string | null;
  probableYear?: number | null;
  rawTextHints?: string[];
  probableMediaType?: "movie" | "tv" | "music" | "game" | "book" | "unknown";
  overrideTitle?: string | null;
  overrideYear?: number | null;
  overrideMediaType?: "movie" | "tv" | "music" | "game" | "book" | "unknown";
}

export interface ReminderEnrichmentPayload extends BaseEnrichmentPayload {
  reminderText?: string | null;
  dueDateText?: string | null;
  recurrenceText?: string | null;
  priorityScore?: number | null;
  recurrenceHint?: boolean;
}

export interface ShoppingEnrichmentPayload extends BaseEnrichmentPayload {
  itemNameGuess?: string | null;
  quantityGuess?: string | null;
  categoryGuess?: string | null;
  urgencyScore?: number | null;
  items?: string[] | null;
}

export interface TodoEnrichmentPayload extends BaseEnrichmentPayload {
  summary?: string | null;
  estimatedSize?: "S" | "M" | "L" | null;
}

export interface JournalEnrichmentPayload extends BaseEnrichmentPayload {
  entryText?: string | null;
  themes?: string[] | null;
  mood?: string | null;
}

export interface TarotEnrichmentPayload extends BaseEnrichmentPayload {
  cardName?: string | null;
  interpretation?: string | null;
  readingContext?: string | null;
}

export interface IdeaEnrichmentPayload extends BaseEnrichmentPayload {
  title?: string | null;
  description?: string | null;
  category?: string | null;
}

export type EnrichmentTask =
  | {
      type: "media";
      payload: MediaEnrichmentPayload;
    }
  | {
      type: "reminder";
      payload: ReminderEnrichmentPayload;
    }
  | {
      type: "shopping";
      payload: ShoppingEnrichmentPayload;
    }
  | {
      type: "todo";
      payload: TodoEnrichmentPayload;
    }
  | {
      type: "journal";
      payload: JournalEnrichmentPayload;
    }
  | {
      type: "tarot";
      payload: TarotEnrichmentPayload;
    }
  | {
      type: "idea";
      payload: IdeaEnrichmentPayload;
    };

export interface MemoWriteRequest {
  transcript: string;
  memoDrafts: UnderstandingMemo[];
  metadata: CaptureMetadata;
  understanding: UnderstandingResult;
  transcriptionResult: TranscriptionResult;
  transcriptionId: string;
}

export interface MemoWriteResult {
  transcriptionId: string;
  memos: Array<{
    id: string;
    category: string;
    confidence: number;
    needs_review: boolean;
    extracted: Record<string, unknown> | null;
    tags: string[] | null;
    starred: boolean;
    transcript_excerpt: string | null;
  }>;
}

export interface CapturePipelineResult {
  transcript: string;
  transcriptionId: string;
  memos: MemoWriteResult["memos"];
  events: PipelineEvent[];
  enrichmentTasks?: EnrichmentTask[];
  durationSeconds?: number | null;
  language?: string;
  provider?: string;
}

export type PipelineStage =
  | "capture.received"
  | "transcription.completed"
  | "understanding.completed"
  | "memos.persisted"
  | "enrichment.queued"
  | "pipeline.completed"
  | "pipeline.failed";

export interface PipelineEvent {
  stage: PipelineStage;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: string;
}

export interface QueueJob<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  scheduledFor?: string;
}
