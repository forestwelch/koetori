"use client";

import { BellRing, Clock, Repeat } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { ReminderItem } from "../../types/enrichment";
import { useReminderActions } from "../../hooks/useReminderActions";

interface RemindersBoardProps {
  reminders: ReminderItem[];
  isLoading: boolean;
  error?: Error | null;
  username: string | null;
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
  username,
}: RemindersBoardProps) {
  const { updateReminder, isUpdating } = useReminderActions({ username });

  const scheduleInDays = async (reminder: ReminderItem, days: number) => {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + days);
    await updateReminder({
      memoId: reminder.memoId,
      dueAt: dueAt.toISOString(),
      dueDateText: dueAt.toLocaleString(),
    });
  };

  const setCustomSchedule = async (reminder: ReminderItem) => {
    const defaultValue = reminder.dueAt
      ? new Date(reminder.dueAt).toISOString().slice(0, 16)
      : "";
    const input = prompt(
      "Set a due date/time (YYYY-MM-DD HH:MM)",
      defaultValue
    );
    if (!input) return;

    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      alert("Could not parse that date/time");
      return;
    }

    await updateReminder({
      memoId: reminder.memoId,
      dueAt: parsed.toISOString(),
      dueDateText: parsed.toLocaleString(),
    });
  };

  const toggleRecurring = async (reminder: ReminderItem) => {
    await updateReminder({
      memoId: reminder.memoId,
      isRecurring: !reminder.isRecurring,
    });
  };
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

                <div className="flex-1 space-y-3">
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
                    {reminder.isRecurring && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200">
                        <Repeat className="h-3 w-3" /> Recurring
                      </span>
                    )}
                  </div>

                  <dl className="grid gap-1 text-xs text-slate-400 md:grid-cols-2">
                    {(reminder.dueDateText || reminder.dueAt) && (
                      <div className="flex items-center gap-1">
                        <dt className="font-medium text-slate-300">When</dt>
                        <dd className="flex items-center gap-1 text-slate-300">
                          <Clock className="h-3 w-3" />
                          {reminder.dueDateText ??
                            (reminder.dueAt
                              ? new Date(reminder.dueAt).toLocaleString()
                              : "Unscheduled")}
                        </dd>
                      </div>
                    )}
                    {reminder.recurrenceText && (
                      <div>
                        <dt className="font-medium text-slate-300">
                          Recurrence hint
                        </dt>
                        <dd>{reminder.recurrenceText}</dd>
                      </div>
                    )}
                    {reminder.recurrenceRule && (
                      <div>
                        <dt className="font-medium text-slate-300">
                          Recurrence rule
                        </dt>
                        <dd>{reminder.recurrenceRule}</dd>
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

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200 transition hover:border-fuchsia-400/50 hover:text-fuchsia-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={() => scheduleInDays(reminder, 1)}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200 transition hover:border-fuchsia-400/50 hover:text-fuchsia-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={() => scheduleInDays(reminder, 7)}
                    >
                      Next Week
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-700/40 bg-slate-800/60 px-2 py-1 text-slate-200 transition hover:border-slate-600/50 hover:text-white disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={() => setCustomSchedule(reminder)}
                    >
                      Set custom…
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-200 transition hover:border-sky-400/50 hover:text-sky-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={() => toggleRecurring(reminder)}
                    >
                      {reminder.isRecurring
                        ? "Disable recurring"
                        : "Mark recurring"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
