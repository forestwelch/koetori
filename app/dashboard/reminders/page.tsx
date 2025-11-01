"use client";

import { useUser } from "../../contexts/UserContext";
import { useReminders } from "../../hooks/useEnrichmentData";
import { RemindersBoard } from "../../components/enrichment/RemindersBoard";

export default function RemindersDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: reminders = [],
    isLoading: remindersLoading,
    error: remindersError,
  } = useReminders(username, { enabled });

  if (!enabled) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Reminders</h2>
        <p className="text-slate-400 text-sm">
          Tasks and reminders extracted from your memos
        </p>
      </div>

      <RemindersBoard
        reminders={reminders}
        isLoading={remindersLoading}
        error={remindersError instanceof Error ? remindersError : undefined}
        username={username}
      />
    </div>
  );
}
