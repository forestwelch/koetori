"use client";

import { IdeasBoard } from "../../components/enrichment/IdeasBoard";
import { useUser } from "../../contexts/UserContext";
import { useIdeaItems } from "../../hooks/useEnrichmentData";
import { useScrollToMemo } from "../../hooks/useScrollToMemo";

export default function IdeasDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: ideaItems = [],
    isLoading: ideaLoading,
    error: ideaError,
  } = useIdeaItems(username, { enabled });

  useScrollToMemo();

  return (
    <IdeasBoard
      items={ideaItems}
      isLoading={ideaLoading}
      error={ideaError instanceof Error ? ideaError : undefined}
    />
  );
}
