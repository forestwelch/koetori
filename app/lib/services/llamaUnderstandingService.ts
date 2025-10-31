import Groq from "groq-sdk";
import { UnderstandingResult, UnderstandingTask } from "../pipeline/types";
import { UnderstandingService } from "../pipeline/interfaces";
import { buildSplittingPrompt, validateSplitResult } from "../categorization";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class LlamaUnderstandingService implements UnderstandingService {
  async createTask(payload: {
    transcript: string;
    memoCountHint?: number;
  }): Promise<UnderstandingTask> {
    if (!payload.transcript) {
      throw new Error("Transcript is required for understanding");
    }

    return {
      transcript: payload.transcript,
      memoCountHint: payload.memoCountHint,
    };
  }

  async analyze(task: UnderstandingTask): Promise<UnderstandingResult> {
    const prompt = buildSplittingPrompt(task.transcript);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);
    const validated = validateSplitResult(parsed);

    return {
      shouldSplit: validated.should_split,
      memos: validated.memos.map((memo) => ({
        transcriptExcerpt: memo.transcript_excerpt ?? null,
        category: memo.category,
        confidence: memo.confidence,
        needsReview: memo.confidence < 0.7,
        extracted: memo.extracted ? { ...memo.extracted } : null,
        tags: memo.tags ?? null,
        starred: memo.starred ?? false,
        size: memo.size ?? null,
      })),
      raw: parsed,
    };
  }
}
