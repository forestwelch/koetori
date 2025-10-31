import { QueueDispatcher } from "../pipeline/interfaces";
import { EnrichmentTask, QueueJob } from "../pipeline/types";
import { runEnrichmentTask } from "../enrichment/dispatcher";
import { nanoid } from "nanoid";

export class ImmediateQueueDispatcher implements QueueDispatcher {
  async enqueue(task: EnrichmentTask): Promise<QueueJob> {
    const job = this.createJob(task);
    await runEnrichmentTask(task);
    return job;
  }

  async enqueueMany(tasks: EnrichmentTask[]): Promise<QueueJob[]> {
    const jobs = tasks.map((task) => this.createJob(task));
    for (const task of tasks) {
      await runEnrichmentTask(task);
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
