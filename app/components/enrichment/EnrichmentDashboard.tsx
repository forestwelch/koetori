"use client";

import {
  useMediaItems,
  useReminders,
  useShoppingList,
} from "../../hooks/useEnrichmentData";
import { MediaLibrary } from "./MediaLibrary";
import { RemindersBoard } from "./RemindersBoard";
import { ShoppingListBoard } from "./ShoppingListBoard";

interface EnrichmentDashboardProps {
  username: string | null;
}

export function EnrichmentDashboard({ username }: EnrichmentDashboardProps) {
  const enabled = Boolean(username);

  const {
    data: mediaItems = [],
    isLoading: mediaLoading,
    error: mediaError,
  } = useMediaItems(username, { enabled });

  const {
    data: reminders = [],
    isLoading: remindersLoading,
    error: remindersError,
  } = useReminders(username, { enabled });

  const {
    data: shoppingItems = [],
    isLoading: shoppingLoading,
    error: shoppingError,
  } = useShoppingList(username, { enabled });

  if (!enabled) {
    return null;
  }

  return (
    <div className="space-y-10">
      <MediaLibrary
        items={mediaItems}
        isLoading={mediaLoading}
        error={mediaError instanceof Error ? mediaError : undefined}
      />
      <RemindersBoard
        reminders={reminders}
        isLoading={remindersLoading}
        error={remindersError instanceof Error ? remindersError : undefined}
        username={username}
      />
      <ShoppingListBoard
        items={shoppingItems}
        isLoading={shoppingLoading}
        error={shoppingError instanceof Error ? shoppingError : undefined}
      />
    </div>
  );
}
