"use client";

import { BellRing } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { ReminderItem } from "../../types/enrichment";

interface RemindersBoardProps {
  reminders: ReminderItem[];
  isLoading: boolean;
  error?: Error | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  sent: "Sent",
  acknowledged: "Acknowledged",
  dismissed: "Dismissed",
};

export function RemindersBoard({
  reminders,
  isLoading,
  error,
}: RemindersBoardProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Reminder Inbox</h2>
          <p className="text-sm text-slate-400">
            Draft reminders parsed from your captured memos.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-500" />
          Gathering reminders…
        </div>
      ) : error ? (
        <div className="text-sm text-rose-400">
          Failed to load reminders: {error.message}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-sm text-slate-500">
          No reminders yet. Add intentions like “remind me to …” and they’ll
          appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card
              key={reminder.memoId}
              variant="default"
              padding="md"
              className="border-slate-700/30 bg-[#141726]/70"
            >
              <CardContent className="flex items-start gap-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300">
                  <BellRing className="h-4 w-4" />
                </span>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-white">
                      {reminder.title}
                    </h3>
                    <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[11px] text-fuchsia-200">
                      {STATUS_LABELS[reminder.status] ?? reminder.status}
                    </span>
                    {reminder.priorityScore !== null && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                        Priority {reminder.priorityScore.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <dl className="grid gap-1 text-xs text-slate-400 md:grid-cols-2">
                    {reminder.dueDateText && (
                      <div>
                        <dt className="font-medium text-slate-300">When</dt>
                        <dd>{reminder.dueDateText}</dd>
                      </div>
                    )}
                    {reminder.recurrenceText && (
                      <div>
                        <dt className="font-medium text-slate-300">
                          Recurrence
                        </dt>
                        <dd>{reminder.recurrenceText}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-slate-300">
                        Last updated
                      </dt>
                      <dd>{reminder.updatedAt.toLocaleString()}</dd>
                    </div>
                  </dl>

                  {reminder.transcriptExcerpt && (
                    <blockquote className="rounded-md border border-slate-700/30 bg-slate-900/30 px-3 py-2 text-xs italic text-slate-400">
                      “{reminder.transcriptExcerpt}”
                    </blockquote>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
