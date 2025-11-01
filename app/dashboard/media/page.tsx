"use client";

import { useUser } from "../../contexts/UserContext";
import { useMediaItems } from "../../hooks/useEnrichmentData";
import { MediaLibrary } from "../../components/enrichment/MediaLibrary";
import { useRequeueEnrichment } from "../../hooks/useRequeueEnrichment";
import { useRemoveMediaItem } from "../../hooks/useRemoveMediaItem";
import { useState } from "react";

export default function MediaDashboardPage() {
  const { username } = useUser();
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

  if (!enabled) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Media Library</h2>
        <p className="text-slate-400 text-sm">
          Movies, shows, games, and music discovered from your memos
        </p>
      </div>

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
    </div>
  );
}
