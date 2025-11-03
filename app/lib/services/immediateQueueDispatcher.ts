import { QueueDispatcher } from "../pipeline/interfaces";
import { EnrichmentTask, QueueJob } from "../pipeline/types";
import { runEnrichmentTask } from "../enrichment/dispatcher";
import { nanoid } from "nanoid";

export class ImmediateQueueDispatcher implements QueueDispatcher {
  async enqueue(task: EnrichmentTask): Promise<QueueJob> {
    const job = this.createJob(task);
    try {
      await runEnrichmentTask(task);
    } catch (error) {
      console.error("[queue] enrichment task failed", {
        taskType: task.type,
        memoId: task.payload.memoId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - allow other enrichments to continue
      // But log the error so we can debug
    }
    return job;
  }

  async enqueueMany(tasks: EnrichmentTask[]): Promise<QueueJob[]> {
    const jobs = tasks.map((task) => this.createJob(task));
    for (const task of tasks) {
      try {
        await runEnrichmentTask(task);
      } catch (error) {
        console.error("[queue] enrichment task failed", {
          taskType: task.type,
          memoId: task.payload.memoId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Continue processing other tasks
      }
    }
    return jobs;
  }

  private createJob(task: EnrichmentTask): QueueJob {
    return {
      id: nanoid(),
      type: `enrichment.${task.type}`,
      payload: task,
    };
  }
}
