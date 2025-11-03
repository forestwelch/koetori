"use client";

import { TarotBoard } from "../../components/enrichment/TarotBoard";
import { useUser } from "../../contexts/UserContext";
import { useTarotItems } from "../../hooks/useEnrichmentData";

export default function TarotDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: tarotItems = [],
    isLoading: tarotLoading,
    error: tarotError,
  } = useTarotItems(username, { enabled });

  return (
    <TarotBoard
      items={tarotItems}
      isLoading={tarotLoading}
      error={tarotError instanceof Error ? tarotError : undefined}
    />
  );
}
