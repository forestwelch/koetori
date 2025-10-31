import { QueueDispatcher } from "../pipeline/interfaces";
import { EnrichmentTask, QueueJob } from "../pipeline/types";
import { nanoid } from "nanoid";

export class ConsoleQueueDispatcher implements QueueDispatcher {
  async enqueue(task: EnrichmentTask): Promise<QueueJob> {
    const job = this.createJob(task);
    console.info("[queue] enqueue", job);
    return job;
  }

  async enqueueMany(tasks: EnrichmentTask[]): Promise<QueueJob[]> {
    const jobs = tasks.map((task) => this.createJob(task));
    if (jobs.length > 0) {
      console.info(
        "[queue] enqueueMany",
        jobs.map((job) => job.id)
      );
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
