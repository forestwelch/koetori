import { TodoEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, TodoItemDraft } from "./types";

const DEFAULT_SUMMARY = "Untitled todo";

export async function handleTodoTask(
  payload: TodoEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const summary =
    payload.summary ??
    extractFromPayload(payload, ["what", "summary", "action", "title"]) ??
    DEFAULT_SUMMARY;

  const draft: TodoItemDraft = {
    summary,
    size: payload.estimatedSize ?? "M",
  };

  return {
    status: "completed",
    type: "todo",
    draft,
    payload,
  };
}

function extractFromPayload(
  payload: TodoEnrichmentPayload,
  keys: string[]
): string | null {
  if (payload.extracted) {
    for (const key of keys) {
      const value = payload.extracted[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  if (payload.transcriptExcerpt) {
    // Use first 200 chars of transcript as fallback
    const trimmed = payload.transcriptExcerpt.trim().substring(0, 200);
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}
