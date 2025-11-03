"use client";

import { useUser } from "../../contexts/UserContext";
import { useShoppingList } from "../../hooks/useEnrichmentData";
import { ShoppingListBoard } from "../../components/enrichment/ShoppingListBoard";
import { useScrollToMemo } from "../../hooks/useScrollToMemo";

export default function ShoppingDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: shoppingItems = [],
    isLoading: shoppingLoading,
    error: shoppingError,
  } = useShoppingList(username, { enabled });

  // Handle scrolling to memo when memoId is in URL
  useScrollToMemo();

  if (!enabled) {
    return null;
  }

  return (
    <ShoppingListBoard
      items={shoppingItems}
      isLoading={shoppingLoading}
      error={shoppingError instanceof Error ? shoppingError : undefined}
      username={username}
    />
  );
}
