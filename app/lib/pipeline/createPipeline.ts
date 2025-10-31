import { CapturePipeline } from "./pipeline";
import { PipelineServices } from "./interfaces";
import { DefaultCaptureService } from "../services/defaultCaptureService";
import { GroqTranscriptionService } from "../services/groqTranscriptionService";
import { LlamaUnderstandingService } from "../services/llamaUnderstandingService";
import { SupabaseMemoWriter } from "../services/supabaseMemoWriter";
import { ConsoleQueueDispatcher } from "../services/consoleQueueDispatcher";
import { ImmediateQueueDispatcher } from "../services/immediateQueueDispatcher";

export function createDefaultPipeline(): CapturePipeline {
  const services: PipelineServices = {
    capture: new DefaultCaptureService(),
    transcription: new GroqTranscriptionService(),
    understanding: new LlamaUnderstandingService(),
    memoWriter: new SupabaseMemoWriter(),
    queue:
      process.env.ENRICHMENT_MODE === "immediate"
        ? new ImmediateQueueDispatcher()
        : new ConsoleQueueDispatcher(),
  };

  return new CapturePipeline(services);
}
