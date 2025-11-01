"use client";

import {
  useMediaItems,
  useReminders,
  useShoppingList,
} from "../../hooks/useEnrichmentData";
import { MediaLibrary } from "./MediaLibrary";
import { RemindersBoard } from "./RemindersBoard";
import { ShoppingListBoard } from "./ShoppingListBoard";
import { useRequeueEnrichment } from "../../hooks/useRequeueEnrichment";
import { useRemoveMediaItem } from "../../hooks/useRemoveMediaItem";
import { useState } from "react";

interface EnrichmentDashboardProps {
  username: string | null;
}

export function EnrichmentDashboard({ username }: EnrichmentDashboardProps) {
  const enabled = Boolean(username);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { requeue, isRequeueing } = useRequeueEnrichment(username ?? null);
  const { removeMediaItem, isRemoving } = useRemoveMediaItem(username ?? null);

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
        onRefresh={async (options) => {
          if (!options.memoId) return;
          setRefreshingId(options.memoId);
          try {
            await requeue({
              memoId: options.memoId,
              overrideTitle: options.overrideTitle,
              overrideYear: options.overrideYear ?? undefined,
              overrideMediaType: options.overrideMediaType ?? undefined,
            });
          } finally {
            setRefreshingId(null);
          }
        }}
        onRemove={async (memoId) => {
          setRemovingId(memoId);
          try {
            await removeMediaItem(memoId);
          } finally {
            setRemovingId(null);
          }
        }}
        refreshingId={refreshingId && isRequeueing ? refreshingId : null}
        removingId={removingId && isRemoving ? removingId : null}
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
        username={username}
      />
    </div>
  );
}
