"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  BellRing,
  Clock,
  Repeat,
  Slash,
  BookOpen,
  CheckCircle2,
  Zap,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { ReminderItem } from "../../types/enrichment";
import { useReminderActions } from "../../hooks/useReminderActions";
import { useToast } from "../../contexts/ToastContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { useModals } from "../../contexts/ModalContext";

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
  const { showError, showWarning, showSuccess } = useToast();
  const { updateReminder, isUpdating } = useReminderActions({ username });
  const [activeTab, setActiveTab] = useState<
    "inbox" | "scheduled" | "dismissed" | "overdue" | "recurring"
  >("inbox");
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(
    null
  );
  const reminderRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filteredReminders = useMemo(() => {
    switch (activeTab) {
      case "scheduled":
        return reminders.filter((reminder) => reminder.dueAt !== null);
      case "dismissed":
        return reminders.filter((reminder) => reminder.status === "dismissed");
      case "overdue": {
        const now = new Date();
        return reminders.filter(
          (r) =>
            r.dueAt !== null &&
            new Date(r.dueAt) < now &&
            r.status !== "dismissed" &&
            r.status !== "acknowledged"
        );
      }
      case "recurring":
        return reminders.filter((reminder) => reminder.isRecurring);
      case "inbox":
      default:
        return reminders.filter(
          (reminder) =>
            reminder.dueAt === null && reminder.status !== "dismissed"
        );
    }
  }, [activeTab, reminders]);

  const scheduleInDays = async (reminder: ReminderItem, days: number) => {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + days);
    await updateReminder({
      memoId: reminder.memoId,
      dueAt: dueAt.toISOString(),
      dueDateText: dueAt.toLocaleString(),
      status: "scheduled",
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
      showError(
        "Could not parse that date/time. Please use format: YYYY-MM-DD HH:MM"
      );
      return;
    }

    await updateReminder({
      memoId: reminder.memoId,
      dueAt: parsed.toISOString(),
      dueDateText: parsed.toLocaleString(),
      status: "scheduled",
    });
  };

  const toggleRecurring = async (reminder: ReminderItem) => {
    await updateReminder({
      memoId: reminder.memoId,
      isRecurring: !reminder.isRecurring,
    });
  };

  const markDone = async (reminder: ReminderItem) => {
    await updateReminder({
      memoId: reminder.memoId,
      status: "acknowledged",
    });
    showSuccess("Reminder marked as done");
  };

  const snoozeReminder = async (reminder: ReminderItem, hours: number) => {
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + hours);
    await updateReminder({
      memoId: reminder.memoId,
      dueAt: dueAt.toISOString(),
      dueDateText: dueAt.toLocaleString(),
      status: "scheduled",
    });
    showSuccess(`Reminder snoozed for ${hours} hour${hours !== 1 ? "s" : ""}`);
  };

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = reminders.length;
    const inbox = reminders.filter(
      (r) => r.dueAt === null && r.status !== "dismissed"
    ).length;
    const scheduled = reminders.filter((r) => r.dueAt !== null).length;
    const dismissed = reminders.filter((r) => r.status === "dismissed").length;
    const acknowledged = reminders.filter(
      (r) => r.status === "acknowledged"
    ).length;
    const recurring = reminders.filter((r) => r.isRecurring).length;
    const highPriority = reminders.filter(
      (r) => r.priorityScore !== null && r.priorityScore >= 0.7
    ).length;

    // Calculate overdue reminders (scheduled but past due)
    const now = new Date();
    const overdue = reminders.filter(
      (r) =>
        r.dueAt !== null &&
        new Date(r.dueAt) < now &&
        r.status !== "dismissed" &&
        r.status !== "acknowledged"
    ).length;

    return {
      total,
      inbox,
      scheduled,
      dismissed,
      acknowledged,
      recurring,
      highPriority,
      overdue,
    };
  }, [reminders]);

  // Keyboard shortcuts
  useEffect(() => {
    if (
      activeTab !== "inbox" &&
      activeTab !== "scheduled" &&
      activeTab !== "overdue" &&
      activeTab !== "recurring"
    )
      return;
    if (filteredReminders.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Arrow keys for navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = selectedReminderId
          ? filteredReminders.findIndex((r) => r.memoId === selectedReminderId)
          : -1;

        let nextIndex: number;
        if (e.key === "ArrowDown") {
          nextIndex =
            currentIndex < filteredReminders.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : filteredReminders.length - 1;
        }

        const nextReminder = filteredReminders[nextIndex];
        if (nextReminder) {
          setSelectedReminderId(nextReminder.memoId);
          // Scroll into view
          const element = reminderRefs.current.get(nextReminder.memoId);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Actions on selected reminder
      if (!selectedReminderId) return;

      const selectedReminder = filteredReminders.find(
        (r) => r.memoId === selectedReminderId
      );
      if (!selectedReminder) return;

      switch (e.key.toLowerCase()) {
        case "d":
          e.preventDefault();
          updateReminder({
            memoId: selectedReminder.memoId,
            status: "dismissed",
          });
          setSelectedReminderId(null);
          break;
        case "m":
          e.preventDefault();
          markDone(selectedReminder);
          setSelectedReminderId(null);
          break;
        case "1":
          e.preventDefault();
          scheduleInDays(selectedReminder, 1);
          setSelectedReminderId(null);
          break;
        case "7":
          e.preventDefault();
          scheduleInDays(selectedReminder, 7);
          setSelectedReminderId(null);
          break;
        case "s":
          e.preventDefault();
          snoozeReminder(selectedReminder, 1);
          setSelectedReminderId(null);
          break;
        case "4":
          if (e.shiftKey) {
            e.preventDefault();
            snoozeReminder(selectedReminder, 4);
            setSelectedReminderId(null);
          }
          break;
        case "enter":
        case " ":
          e.preventDefault();
          setCustomSchedule(selectedReminder);
          setSelectedReminderId(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    filteredReminders,
    selectedReminderId,
    activeTab,
    updateReminder,
    scheduleInDays,
    markDone,
    snoozeReminder,
    setCustomSchedule,
  ]);
  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Reminder Inbox</h2>
            <p className="text-sm text-slate-400">
              Draft reminders parsed from your captured memos.
            </p>
          </div>
          {/* Analytics - Clickable Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {analytics.inbox > 0 && (
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "inbox"
                    ? "border-fuchsia-500/60 bg-fuchsia-500/20 text-fuchsia-200"
                    : "border-slate-700/40 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-600/50"
                }`}
              >
                <BellRing className="h-3.5 w-3.5 text-fuchsia-400" />
                <span className="font-medium">{analytics.inbox}</span>
                <span>inbox</span>
              </button>
            )}
            {analytics.overdue > 0 && (
              <button
                onClick={() => setActiveTab("overdue")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "overdue"
                    ? "border-rose-500/60 bg-rose-500/20 text-rose-200"
                    : "border-slate-700/40 bg-slate-900/40 text-rose-400 hover:text-rose-300 hover:border-rose-500/50"
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-medium">{analytics.overdue}</span>
                <span>overdue</span>
              </button>
            )}
            {analytics.scheduled > 0 && (
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "scheduled"
                    ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-200"
                    : "border-slate-700/40 bg-slate-900/40 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/50"
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-medium">{analytics.scheduled}</span>
                <span>scheduled</span>
              </button>
            )}
            {analytics.recurring > 0 && (
              <button
                onClick={() => setActiveTab("recurring")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "recurring"
                    ? "border-sky-500/60 bg-sky-500/20 text-sky-200"
                    : "border-slate-700/40 bg-slate-900/40 text-sky-400 hover:text-sky-300 hover:border-sky-500/50"
                }`}
              >
                <Repeat className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-medium">{analytics.recurring}</span>
                <span>recurring</span>
              </button>
            )}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/40 bg-[#131728]/70 p-1 text-[11px] text-slate-300">
          {[
            { key: "inbox" as const, label: "Inbox" },
            { key: "scheduled" as const, label: "Scheduled" },
            { key: "overdue" as const, label: "Overdue" },
            { key: "recurring" as const, label: "Recurring" },
            { key: "dismissed" as const, label: "Dismissed" },
          ]
            .filter((tab) => {
              // Only show overdue and recurring tabs if they have items
              if (tab.key === "overdue" && analytics.overdue === 0)
                return false;
              if (tab.key === "recurring" && analytics.recurring === 0)
                return false;
              return true;
            })
            .map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-1 transition ${
                  activeTab === tab.key
                    ? "bg-fuchsia-500/30 text-white shadow"
                    : "hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="md" message="Loading reminders..." />
        </div>
      ) : error ? (
        <div className="text-sm text-rose-400">
          Failed to load reminders: {error.message}
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="text-sm text-slate-500">
          {activeTab === "inbox"
            ? "Inbox is clear. Capture new reminders to see them here."
            : activeTab === "scheduled"
              ? "No scheduled reminders yet."
              : activeTab === "overdue"
                ? "No overdue reminders. Great job staying on top of things!"
                : activeTab === "recurring"
                  ? "No recurring reminders yet."
                  : "No dismissed reminders."}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Keyboard Shortcuts Hint */}
          {filteredReminders.length > 0 &&
            (activeTab === "inbox" || activeTab === "scheduled") && (
              <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 px-3 py-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-medium text-slate-300">
                    Keyboard Shortcuts:
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      ↑↓
                    </kbd>{" "}
                    Navigate
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      M
                    </kbd>{" "}
                    Mark done
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      D
                    </kbd>{" "}
                    Dismiss
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      S
                    </kbd>{" "}
                    Snooze 1h
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      ⇧4
                    </kbd>{" "}
                    Snooze 4h
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      1
                    </kbd>{" "}
                    Tomorrow
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      7
                    </kbd>{" "}
                    Next week
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">
                      Enter
                    </kbd>{" "}
                    Custom schedule
                  </span>
                </div>
              </div>
            )}
          {filteredReminders.map((reminder) => (
            <Card
              key={reminder.memoId}
              ref={(el) => {
                if (el) reminderRefs.current.set(reminder.memoId, el);
              }}
              variant="default"
              padding="md"
              className={`border-slate-700/30 bg-[#141726]/70 transition-all ${
                selectedReminderId === reminder.memoId
                  ? "ring-2 ring-fuchsia-500/50 border-fuchsia-500/50"
                  : ""
              }`}
              data-memo-id={reminder.memoId}
              onClick={() => setSelectedReminderId(reminder.memoId)}
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

                  <ViewMemoButton memoId={reminder.memoId} />

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {/* Mark Done */}
                    {reminder.status !== "acknowledged" && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200 transition hover:border-emerald-400/50 hover:text-emerald-100 disabled:opacity-50"
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation();
                          markDone(reminder);
                        }}
                        title="Mark done (M)"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </button>
                    )}
                    {/* Snooze Options */}
                    <button
                      type="button"
                      className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-indigo-200 transition hover:border-indigo-400/50 hover:text-indigo-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        snoozeReminder(reminder, 1);
                      }}
                      title="Snooze 1 hour (S)"
                    >
                      1h
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-indigo-200 transition hover:border-indigo-400/50 hover:text-indigo-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        snoozeReminder(reminder, 4);
                      }}
                      title="Snooze 4 hours (⇧4)"
                    >
                      4h
                    </button>
                    {/* Schedule Options */}
                    <button
                      type="button"
                      className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200 transition hover:border-fuchsia-400/50 hover:text-fuchsia-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        scheduleInDays(reminder, 1);
                      }}
                      title="Schedule for tomorrow (1)"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200 transition hover:border-fuchsia-400/50 hover:text-fuchsia-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        scheduleInDays(reminder, 7);
                      }}
                      title="Schedule for next week (7)"
                    >
                      Next Week
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-700/40 bg-slate-800/60 px-2 py-1 text-slate-200 transition hover:border-slate-600/50 hover:text-white disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomSchedule(reminder);
                      }}
                      title="Set custom schedule (Enter)"
                    >
                      Custom…
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-200 transition hover:border-sky-400/50 hover:text-sky-100 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRecurring(reminder);
                      }}
                    >
                      {reminder.isRecurring
                        ? "Stop recurring"
                        : "Make recurring"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700/40 bg-slate-900/50 px-2 py-1 text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200 disabled:opacity-50"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateReminder({
                          memoId: reminder.memoId,
                          status: "dismissed",
                        });
                      }}
                      title="Dismiss (D)"
                    >
                      <Slash className="h-3 w-3" /> Dismiss
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

function ViewMemoButton({ memoId }: { memoId: string }) {
  const { setShowMemoModal, setMemoModalId } = useModals();

  const handleViewMemo = (e: React.MouseEvent) => {
    e.preventDefault();
    setMemoModalId(memoId);
    setShowMemoModal(true);
  };

  return (
    <div className="flex items-center justify-between text-[11px] text-slate-400">
      <button
        onClick={handleViewMemo}
        className="rounded-full border border-slate-700/40 px-2 py-0.5 transition hover:border-fuchsia-400/40 hover:text-white flex items-center gap-1"
      >
        <BookOpen className="w-3 h-3" />
        View memo
      </button>
    </div>
  );
}
