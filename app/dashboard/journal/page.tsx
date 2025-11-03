"use client";

import { JournalBoard } from "../../components/enrichment/JournalBoard";
import { useUser } from "../../contexts/UserContext";
import { useJournalItems } from "../../hooks/useEnrichmentData";
import { useScrollToMemo } from "../../hooks/useScrollToMemo";

export default function JournalDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: journalItems = [],
    isLoading: journalLoading,
    error: journalError,
  } = useJournalItems(username, { enabled });

  useScrollToMemo();

  return (
    <JournalBoard
      items={journalItems}
      isLoading={journalLoading}
      error={journalError instanceof Error ? journalError : undefined}
    />
  );
}
