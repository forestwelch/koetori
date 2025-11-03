"use client";

import { useMemo, useState } from "react";
import { MediaItem, MediaStatus } from "../../types/enrichment";
import {
  Sparkles,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  Music4,
  Grid3x3,
  List,
  ArrowUpDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { FixMatchModal } from "./FixMatchModal";
import { useToast } from "../../contexts/ToastContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";

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
type StatusFilter = "all" | "to-watch" | "watched" | "backlog";
type SortOption = "newest" | "oldest" | "title" | "year";
type ViewMode = "grid" | "grouped";

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

const STATUS_FILTER_OPTIONS: Array<{
  key: StatusFilter;
  label: string;
}> = [
  { key: "all", label: "All Status" },
  { key: "to-watch", label: "To Watch" },
  { key: "watched", label: "Watched" },
  { key: "backlog", label: "Backlog" },
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
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixMatchItem, setFixMatchItem] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
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

  const handleStatusChange = async (memoId: string, status: MediaStatus) => {
    setUpdatingStatusId(memoId);
    try {
      // Optimistically update UI - update all media-items queries
      queryClient.setQueriesData<MediaItem[]>(
        { queryKey: ["media-items"] },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((item) =>
            item.memoId === memoId ? { ...item, status } : item
          );
        }
      );

      const response = await fetch(`/api/media/${memoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      showSuccess(
        status === "watched"
          ? "Marked as watched"
          : status === "backlog"
            ? "Added to backlog"
            : "Removed from backlog"
      );

      // Invalidate to ensure consistency
      await queryClient.invalidateQueries({
        queryKey: ["media-items"],
      });
    } catch (error) {
      showError(
        error instanceof Error
          ? `Failed to update status: ${error.message}`
          : "Failed to update status"
      );
      // Revert optimistic update
      await queryClient.invalidateQueries({
        queryKey: ["media-items"],
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Extract all unique genres from items
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    items.forEach((item) => {
      item.genres?.forEach((genre) => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by media type
    if (filter !== "all") {
      filtered = filtered.filter((item) => item.mediaType === filter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by genre
    if (genreFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.genres?.includes(genreFilter) ?? false
      );
    }

    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "year":
          const yearA = a.releaseYear ?? 0;
          const yearB = b.releaseYear ?? 0;
          return yearB - yearA; // Newest year first
        case "oldest":
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case "newest":
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    return sorted;
  }, [items, filter, statusFilter, genreFilter, sortBy]);

  // Group items for grouped view
  const groupedItems = useMemo(() => {
    if (viewMode !== "grouped") return null;

    const groups: Record<string, MediaItem[]> = {};
    filteredItems.forEach((item) => {
      // Group by status first, then by type
      const groupKey = `${item.status}-${item.mediaType || "unknown"}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Sort groups: overdue first, then by status priority, then by type
    const statusPriority: Record<string, number> = {
      "to-watch": 1,
      watched: 2,
      backlog: 3,
    };

    return Object.fromEntries(
      Object.entries(groups).sort(([keyA], [keyB]) => {
        const [statusA, typeA] = keyA.split("-");
        const [statusB, typeB] = keyB.split("-");
        const priorityA = statusPriority[statusA] || 99;
        const priorityB = statusPriority[statusB] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return typeA.localeCompare(typeB);
      })
    );
  }, [filteredItems, viewMode]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = items.length;
    const byType = {
      movie: items.filter((i) => i.mediaType === "movie").length,
      tv: items.filter((i) => i.mediaType === "tv").length,
      game: items.filter((i) => i.mediaType === "game").length,
      book: items.filter((i) => i.mediaType === "book").length,
      music: items.filter((i) => i.mediaType === "music").length,
    };
    const byStatus = {
      "to-watch": items.filter((i) => i.status === "to-watch").length,
      watched: items.filter((i) => i.status === "watched").length,
      backlog: items.filter((i) => i.status === "backlog").length,
    };
    return { total, byType, byStatus };
  }, [items]);

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Media Library</h2>
            <p className="text-sm text-slate-400">
              Automatically enriched movies, shows, books, and more.
            </p>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-medium text-white">{stats.total}</span>
            <span>items</span>
            {stats.byStatus["to-watch"] > 0 && (
              <>
                <span>•</span>
                <span className="text-emerald-400">
                  {stats.byStatus["to-watch"]} to watch
                </span>
              </>
            )}
            {stats.byStatus.watched > 0 && (
              <>
                <span>•</span>
                <span className="text-indigo-400">
                  {stats.byStatus.watched} watched
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Media Type Filters */}
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
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTER_OPTIONS.map(({ key, label }) => {
                const isActive = statusFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      isActive
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-200"
                        : "border-slate-700/60 bg-slate-900/40 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* View Controls */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white pr-8 hover:border-slate-600/50 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A-Z</option>
                <option value="year">Year (newest)</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/50 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-400 hover:text-white"
                }`}
                aria-label="Grid view"
                title="Grid view - Show all items in a grid"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grouped")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grouped"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-400 hover:text-white"
                }`}
                aria-label="Grouped view"
                title="Grouped view - Organize by status (To Watch, Watched, Backlog) and type (Movies, TV Shows, etc.)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Genre Filter */}
        {availableGenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Genre:</span>
            <button
              onClick={() => setGenreFilter("all")}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                genreFilter === "all"
                  ? "border-purple-500/60 bg-purple-500/20 text-purple-200"
                  : "border-slate-700/60 bg-slate-900/40 text-slate-400 hover:text-slate-300"
              }`}
            >
              All
            </button>
            {availableGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => setGenreFilter(genre)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  genreFilter === genre
                    ? "border-purple-500/60 bg-purple-500/20 text-purple-200"
                    : "border-slate-700/60 bg-slate-900/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                {genre}
              </button>
            ))}
            {availableGenres.length > 10 && (
              <span className="text-xs text-slate-500">
                +{availableGenres.length - 10} more
              </span>
            )}
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="md" message="Loading media..." />
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
      ) : viewMode === "grouped" && groupedItems ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([groupKey, groupItems]) => {
            const [status, type] = groupKey.split("-");
            const statusLabel =
              status === "to-watch"
                ? "To Watch"
                : status === "watched"
                  ? "Watched"
                  : "Backlog";
            const typeLabel =
              type === "movie"
                ? "Movies"
                : type === "tv"
                  ? "TV Shows"
                  : type === "game"
                    ? "Games"
                    : type === "book"
                      ? "Books"
                      : type === "music"
                        ? "Music"
                        : type === "unknown" || !type
                          ? "Uncategorized"
                          : type.charAt(0).toUpperCase() + type.slice(1);

            return (
              <div key={groupKey} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/30 pb-2">
                  <h3 className="text-sm font-semibold text-white">
                    {statusLabel} • {typeLabel}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {groupItems.length} item
                    {groupItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {groupItems.map((item) => {
                    const formattedTimeToBeat = formatTimeToBeat(
                      item.timeToBeatMinutes
                    );
                    const isDescriptionExpanded = expandedDescriptions.has(
                      item.memoId
                    );
                    const isProvidersExpanded = expandedProviders.has(
                      item.memoId
                    );

                    return (
                      <div key={item.memoId} data-memo-id={item.memoId}>
                        <MediaCard
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
                          onFixMatch={
                            onRefresh ? () => setFixMatchItem(item) : undefined
                          }
                          onRemove={
                            onRemove ? () => handleRemove(item) : undefined
                          }
                          onStatusChange={handleStatusChange}
                          isFixing={fixingId === item.memoId}
                          isRemoving={removingId === item.memoId}
                          isUpdatingStatus={updatingStatusId === item.memoId}
                          refreshingId={refreshingId}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
              <div key={item.memoId} data-memo-id={item.memoId}>
                <MediaCard
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
                  onFixMatch={
                    onRefresh ? () => setFixMatchItem(item) : undefined
                  }
                  onRemove={onRemove ? () => handleRemove(item) : undefined}
                  onStatusChange={handleStatusChange}
                  isFixing={fixingId === item.memoId}
                  isRemoving={removingId === item.memoId}
                  isUpdatingStatus={updatingStatusId === item.memoId}
                  refreshingId={refreshingId}
                />
              </div>
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
