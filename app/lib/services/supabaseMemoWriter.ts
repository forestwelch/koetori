import { supabase } from "../supabase";
import {
  MemoWriteRequest,
  MemoWriteResult,
  TranscriptionResult,
} from "../pipeline/types";
import { MemoWriterService } from "../pipeline/interfaces";

export class SupabaseMemoWriter implements MemoWriterService {
  async saveTranscription(data: {
    transcript: string;
    metadata: MemoWriteRequest["metadata"];
    transcription: TranscriptionResult;
  }): Promise<{ transcriptionId: string }> {
    const { data: inserted, error } = await supabase
      .from("transcriptions")
      .insert({
        transcript: data.transcript,
        username: data.metadata.username,
        audio_duration_seconds:
          data.metadata.inputType === "audio"
            ? (data.transcription.durationSeconds ?? null)
            : null,
        source: data.metadata.source,
        device_id: data.metadata.deviceId ?? null,
      })
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to save transcription: ${error?.message}`);
    }

    return { transcriptionId: inserted.id };
  }

  async writeMemos(request: MemoWriteRequest): Promise<MemoWriteResult> {
    const memoInserts = request.memoDrafts.map((memo) => ({
      transcript: request.transcript,
      transcription_id: request.transcriptionId,
      transcript_excerpt: memo.transcriptExcerpt ?? null,
      category: memo.category,
      confidence: memo.confidence,
      needs_review: memo.needsReview ?? memo.confidence < 0.7,
      extracted: memo.extracted ?? null,
      tags: memo.tags ?? null,
      starred: memo.starred ?? false,
      size: memo.size ?? null,
      username: request.metadata.username,
      source: request.metadata.source,
      input_type: request.metadata.inputType,
      device_id: request.metadata.deviceId ?? null,
    }));

    const { data, error } = await supabase
      .from("memos")
      .insert(memoInserts)
      .select();

    if (error || !data) {
      throw new Error(`Failed to save memos: ${error?.message}`);
    }

    return {
      transcriptionId: request.transcriptionId,
      memos: data.map((memo) => ({
        id: memo.id,
        category: memo.category,
        confidence: memo.confidence,
        needs_review: memo.needs_review,
        extracted: memo.extracted,
        tags: memo.tags,
        starred: memo.starred,
        size: memo.size,
        transcript_excerpt: memo.transcript_excerpt ?? null,
      })),
    };
  }
}
