import { EnrichmentTask } from "../pipeline/types";
import { handleMediaTask } from "./mediaHandler";
import { handleReminderTask } from "./reminderHandler";
import { handleShoppingTask } from "./shoppingHandler";
import { handleTodoTask } from "./todoHandler";
import { handleJournalTask } from "./journalHandler";
import { handleTarotTask } from "./tarotHandler";
import { handleIdeaTask } from "./ideaHandler";
import { EnrichmentJobResult } from "./types";
import { markMemoProcessed, persistEnrichmentResult } from "./persistence";

export async function runEnrichmentTask(
  task: EnrichmentTask
): Promise<EnrichmentJobResult> {
  switch (task.type) {
    case "media":
      return persist(task, await handleMediaTask(task.payload));
    case "reminder":
      return persist(task, await handleReminderTask(task.payload));
    case "shopping":
      return persist(task, await handleShoppingTask(task.payload));
    case "todo":
      return persist(task, await handleTodoTask(task.payload));
    case "journal":
      return persist(task, await handleJournalTask(task.payload));
    case "tarot":
      return persist(task, await handleTarotTask(task.payload));
    case "idea":
      return persist(task, await handleIdeaTask(task.payload));
    default:
      throw new Error(
        `Unsupported enrichment task type ${(task as { type: string }).type}`
      );
  }
}

async function persist(task: EnrichmentTask, result: EnrichmentJobResult) {
  try {
    if (result.status === "completed") {
      await persistEnrichmentResult(result);
    } else {
      await markMemoProcessed(task.payload.memoId);
    }
  } catch (error) {
    console.error("[enrichment] failed to persist enrichment result", {
      taskType: task.type,
      memoId: task.payload.memoId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Re-throw to ensure the error is visible
    throw error;
  }

  return result;
}
