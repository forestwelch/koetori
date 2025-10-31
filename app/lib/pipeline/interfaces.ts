import {
  CaptureRequest,
  CaptureReceipt,
  TranscriptionJob,
  TranscriptionResult,
  UnderstandingTask,
  UnderstandingResult,
  MemoWriteRequest,
  MemoWriteResult,
  EnrichmentTask,
  QueueJob,
} from "./types";

export interface CaptureService {
  receive(request: CaptureRequest): Promise<CaptureReceipt>;
}

export interface TranscriptionService {
  createJob(request: CaptureRequest): Promise<TranscriptionJob>;
  transcribe(job: TranscriptionJob): Promise<TranscriptionResult>;
}

export interface UnderstandingService {
  createTask(payload: {
    transcript: string;
    memoCountHint?: number;
  }): Promise<UnderstandingTask>;
  analyze(task: UnderstandingTask): Promise<UnderstandingResult>;
}

export interface MemoWriterService {
  saveTranscription(data: {
    transcript: string;
    metadata: CaptureRequest["metadata"];
    transcription: TranscriptionResult;
  }): Promise<{ transcriptionId: string }>;
  writeMemos(request: MemoWriteRequest): Promise<MemoWriteResult>;
}

export interface QueueDispatcher {
  enqueue(task: EnrichmentTask): Promise<QueueJob | void>;
  enqueueMany(tasks: EnrichmentTask[]): Promise<QueueJob[] | void>;
}

export interface PipelineServices {
  capture: CaptureService;
  transcription: TranscriptionService;
  understanding: UnderstandingService;
  memoWriter: MemoWriterService;
  queue: QueueDispatcher;
}
