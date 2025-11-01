"use client";

import { useMemo, useState } from "react";
import { MediaItem } from "../../types/enrichment";
import { Sparkles, Film, Tv, Gamepad2, BookOpen, Music4 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { FixMatchModal } from "./FixMatchModal";
import { useToast } from "../../contexts/ToastContext";

function formatTimeToBeat(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    if (remaining === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remaining}m`;
  }
  return `${minutes}m`;
}

interface MediaLibraryProps {
  items: MediaItem[];
  isLoading: boolean;
  error?: Error | null;
  onRefresh?: (options: {
    memoId: string;
    overrideTitle?: string;
    overrideYear?: number | null;
    overrideMediaType?: MediaItem["mediaType"];
  }) => Promise<void>;
  refreshingId?: string | null;
  onRemove?: (memoId: string) => Promise<void>;
  removingId?: string | null;
}

type MediaFilter = "all" | "movie" | "tv" | "game" | "book" | "music";

const FILTER_OPTIONS: Array<{
  key: MediaFilter;
  icon: LucideIcon;
  label: string;
}> = [
  { key: "all", icon: Sparkles, label: "All media" },
  { key: "movie", icon: Film, label: "Movies" },
  { key: "tv", icon: Tv, label: "TV shows" },
  { key: "game", icon: Gamepad2, label: "Games" },
  { key: "book", icon: BookOpen, label: "Books" },
  { key: "music", icon: Music4, label: "Music" },
];

export function MediaLibrary({
  items,
  isLoading,
  error,
  onRefresh,
  refreshingId,
  onRemove,
  removingId,
}: MediaLibraryProps) {
  const { showError } = useToast();
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixMatchItem, setFixMatchItem] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set()
  );

  const handleFixMatchSubmit = async (
    item: MediaItem,
    data: {
      title: string;
      year: number | null;
      mediaType: MediaItem["mediaType"] | undefined;
    }
  ) => {
    if (!onRefresh) return;
    setFixingId(item.memoId);
    try {
      await onRefresh({
        memoId: item.memoId,
        overrideTitle: data.title,
        overrideYear: data.year,
        overrideMediaType: data.mediaType,
      });
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to refresh media item: ${error.message}`
          : "Unable to refresh media item. Please try again."
      );
    } finally {
      setFixingId(null);
    }
  };

  const handleRemove = async (item: MediaItem) => {
    if (!onRemove) return;
    const confirmed = confirm(
      `Remove "${item.title}" from the media library? This memo will no longer appear here.`
    );
    if (!confirmed) return;
    try {
      await onRemove(item.memoId);
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to remove media item: ${error.message}`
          : "Unable to remove media item. Please try again."
      );
    }
  };

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.mediaType === filter);
  }, [items, filter]);

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Media Library</h2>
          <p className="text-sm text-slate-400">
            Automatically enriched movies, shows, books, and more.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {FILTER_OPTIONS.map(({ key, icon: Icon, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                title={label}
                aria-label={label}
                aria-pressed={isActive}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  isActive
                    ? "border-indigo-500/60 bg-indigo-500/20 text-white shadow"
                    : "border-slate-700/60 bg-slate-900/40 text-slate-300 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          Loading media…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          Failed to load media items: {error.message}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-4 text-sm text-slate-400">
          {filter === "all"
            ? "No media enrichments yet. Capture a memo with a film, show, or book to see it here."
            : `No ${filter.toUpperCase()} entries yet.`}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const formattedTimeToBeat = formatTimeToBeat(
              item.timeToBeatMinutes
            );
            const isDescriptionExpanded = expandedDescriptions.has(item.memoId);
            const isProvidersExpanded = expandedProviders.has(item.memoId);

            return (
              <MediaCard
                key={item.memoId}
                item={item}
                formattedTimeToBeat={formattedTimeToBeat}
                isDescriptionExpanded={isDescriptionExpanded}
                isProvidersExpanded={isProvidersExpanded}
                onToggleDescription={() => {
                  const newExpanded = new Set(expandedDescriptions);
                  if (isDescriptionExpanded) {
                    newExpanded.delete(item.memoId);
                  } else {
                    newExpanded.add(item.memoId);
                  }
                  setExpandedDescriptions(newExpanded);
                }}
                onToggleProviders={() => {
                  const newExpanded = new Set(expandedProviders);
                  if (isProvidersExpanded) {
                    newExpanded.delete(item.memoId);
                  } else {
                    newExpanded.add(item.memoId);
                  }
                  setExpandedProviders(newExpanded);
                }}
                onFixMatch={onRefresh ? () => setFixMatchItem(item) : undefined}
                onRemove={onRemove ? () => handleRemove(item) : undefined}
                isFixing={fixingId === item.memoId}
                isRemoving={removingId === item.memoId}
                refreshingId={refreshingId}
              />
            );
          })}
        </div>
      )}

      {fixMatchItem && (
        <FixMatchModal
          isOpen={!!fixMatchItem}
          onClose={() => setFixMatchItem(null)}
          item={fixMatchItem}
          onSubmit={async (data) => {
            await handleFixMatchSubmit(fixMatchItem, data);
            setFixMatchItem(null);
          }}
          isProcessing={fixingId === fixMatchItem.memoId}
        />
      )}
    </section>
  );
}
