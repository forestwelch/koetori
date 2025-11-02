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
    <RemindersBoard
      reminders={reminders}
      isLoading={remindersLoading}
      error={remindersError instanceof Error ? remindersError : undefined}
      username={username}
    />
  );
}
