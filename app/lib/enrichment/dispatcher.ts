import { EnrichmentTask } from "../pipeline/types";
import { handleMediaTask } from "./mediaHandler";
import { handleReminderTask } from "./reminderHandler";
import { handleShoppingTask } from "./shoppingHandler";
import { handleTodoTask } from "./todoHandler";
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
    default:
      throw new Error(
        `Unsupported enrichment task type ${(task as { type: string }).type}`
      );
  }
}

async function persist(task: EnrichmentTask, result: EnrichmentJobResult) {
  if (result.status === "completed") {
    await persistEnrichmentResult(result);
  } else {
    await markMemoProcessed(task.payload.memoId);
  }

  return result;
}
