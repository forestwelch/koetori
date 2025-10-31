import { nanoid } from "nanoid";
import {
  CapturePipelineResult,
  CaptureRequest,
  PipelineEvent,
  PipelineStage,
  EnrichmentTask,
} from "./types";
import { PipelineServices } from "./interfaces";
import { planEnrichmentTasks } from "../services/enrichmentPlanner";

function event(
  stage: PipelineStage,
  data?: Record<string, unknown>
): PipelineEvent {
  return {
    stage,
    timestamp: new Date().toISOString(),
    data,
  };
}

export class CapturePipeline {
  constructor(private readonly services: PipelineServices) {}

  async run(request: CaptureRequest): Promise<CapturePipelineResult> {
    const events: PipelineEvent[] = [];

    try {
      const receipt = await this.services.capture.receive(request);
      request.metadata.username = receipt.normalizedUsername;
      events.push(event("capture.received", { requestId: receipt.requestId }));

      let transcription;
      if (request.metadata.inputType === "text") {
        transcription = {
          transcript: request.transcript ?? "",
          provider: "direct",
          language: "en",
        };
      } else {
        const job = await this.services.transcription.createJob(request);
        transcription = await this.services.transcription.transcribe(job);
      }

      events.push(
        event("transcription.completed", {
          provider: transcription.provider,
          durationSeconds: transcription.durationSeconds ?? null,
        })
      );

      const task = await this.services.understanding.createTask({
        transcript: transcription.transcript,
      });

      const understanding = await this.services.understanding.analyze(task);

      events.push(
        event("understanding.completed", {
          memoCount: understanding.memos.length,
          shouldSplit: understanding.shouldSplit,
        })
      );

      const { transcriptionId } =
        await this.services.memoWriter.saveTranscription({
          transcript: transcription.transcript,
          metadata: request.metadata,
          transcription,
        });

      const memoWriteResult = await this.services.memoWriter.writeMemos({
        transcript: transcription.transcript,
        memoDrafts: understanding.memos,
        metadata: request.metadata,
        understanding,
        transcriptionResult: transcription,
        transcriptionId,
      });

      events.push(
        event("memos.persisted", {
          transcriptionId,
          memoCount: memoWriteResult.memos.length,
        })
      );

      const enrichmentTasks: EnrichmentTask[] = planEnrichmentTasks({
        memos: memoWriteResult.memos,
        metadata: request.metadata,
        transcriptionId,
      });

      if (enrichmentTasks.length > 0) {
        await this.services.queue.enqueueMany(enrichmentTasks);
        events.push(
          event("enrichment.queued", {
            count: enrichmentTasks.length,
            types: enrichmentTasks.map((task) => task.type),
          })
        );
      }

      const result: CapturePipelineResult = {
        transcript: transcription.transcript,
        transcriptionId,
        memos: memoWriteResult.memos,
        events,
        enrichmentTasks,
        durationSeconds: transcription.durationSeconds ?? null,
        language: transcription.language,
        provider: transcription.provider,
      };

      events.push(
        event("pipeline.completed", {
          memoCount: memoWriteResult.memos.length,
          requestId: receipt.requestId,
        })
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      events.push({
        stage: "pipeline.failed",
        timestamp: new Date().toISOString(),
        error: errorMessage,
      });
      throw err;
    }
  }
}

export function createRequestId() {
  return nanoid();
}
