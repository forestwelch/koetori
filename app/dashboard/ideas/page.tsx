"use client";

import { IdeasBoard } from "../../components/enrichment/IdeasBoard";
import { useUser } from "../../contexts/UserContext";
import { useIdeaItems } from "../../hooks/useEnrichmentData";

export default function IdeasDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: ideaItems = [],
    isLoading: ideaLoading,
    error: ideaError,
  } = useIdeaItems(username, { enabled });

  return (
    <IdeasBoard
      items={ideaItems}
      isLoading={ideaLoading}
      error={ideaError instanceof Error ? ideaError : undefined}
    />
  );
}
