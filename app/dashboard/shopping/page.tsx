"use client";

import { useUser } from "../../contexts/UserContext";
import { useShoppingList } from "../../hooks/useEnrichmentData";
import { ShoppingListBoard } from "../../components/enrichment/ShoppingListBoard";

export default function ShoppingDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: shoppingItems = [],
    isLoading: shoppingLoading,
    error: shoppingError,
  } = useShoppingList(username, { enabled });

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
