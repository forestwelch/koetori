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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Shopping List</h2>
        <p className="text-slate-400 text-sm">
          Items to purchase extracted from your memos
        </p>
      </div>

      <ShoppingListBoard
        items={shoppingItems}
        isLoading={shoppingLoading}
        error={shoppingError instanceof Error ? shoppingError : undefined}
        username={username}
      />
    </div>
  );
}
