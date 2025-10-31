import { EnrichmentTask } from "../pipeline/types";
import { handleMediaTask } from "./mediaHandler";
import { handleReminderTask } from "./reminderHandler";
import { handleShoppingTask } from "./shoppingHandler";
import { EnrichmentJobResult } from "./types";

export async function runEnrichmentTask(
  task: EnrichmentTask
): Promise<EnrichmentJobResult> {
  switch (task.type) {
    case "media":
      return handleMediaTask(task.payload);
    case "reminder":
      return handleReminderTask(task.payload);
    case "shopping":
      return handleShoppingTask(task.payload);
    default:
      throw new Error(
        `Unsupported enrichment task type ${(task as { type: string }).type}`
      );
  }
}
