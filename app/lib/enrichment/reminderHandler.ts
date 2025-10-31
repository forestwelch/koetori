import { ReminderEnrichmentPayload } from "../pipeline/types";
import { EnrichmentJobResult, ReminderDraft } from "./types";

const DEFAULT_TITLE = "Untitled reminder";

export async function handleReminderTask(
  payload: ReminderEnrichmentPayload
): Promise<EnrichmentJobResult> {
  const draft: ReminderDraft = {
    title: deriveTitle(payload),
    dueDateText: payload.dueDateText ?? null,
    recurrenceText: payload.recurrenceText ?? null,
    priorityScore: payload.priorityScore ?? null,
  };

  return {
    status: "completed",
    type: "reminder",
    draft,
    payload,
  };
}

function deriveTitle(payload: ReminderEnrichmentPayload): string {
  if (payload.reminderText && payload.reminderText.trim()) {
    return payload.reminderText.trim();
  }

  if (payload.transcriptExcerpt && payload.transcriptExcerpt.trim()) {
    return payload.transcriptExcerpt.trim();
  }

  if (payload.extracted) {
    const maybeTitle = payload.extracted.title ?? payload.extracted.what;
    if (typeof maybeTitle === "string" && maybeTitle.trim()) {
      return maybeTitle.trim();
    }
  }

  return DEFAULT_TITLE;
}
