"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { MediaItem } from "../../types/enrichment";
import {
  Loader2,
  RefreshCw,
  Wand2,
  Trash2,
  Sparkles,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  Music4,
  ExternalLink,
  Clock3,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

type MediaKind = "movie" | "tv" | "music" | "game" | "book" | "unknown";

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

const TYPE_META: Record<MediaKind, { icon: LucideIcon; label: string }> = {
  movie: { icon: Film, label: "Movie" },
  tv: { icon: Tv, label: "TV" },
  game: { icon: Gamepad2, label: "Game" },
  book: { icon: BookOpen, label: "Book" },
  music: { icon: Music4, label: "Music" },
  unknown: { icon: Sparkles, label: "Media" },
};

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

export function MediaLibrary({
  items,
  isLoading,
  error,
  onRefresh,
  refreshingId,
  onRemove,
  removingId,
}: MediaLibraryProps) {
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");

  const handleFixMatch = async (item: MediaItem) => {
    if (!onRefresh) return;
    const defaultTitle = item.customTitle ?? item.autoTitle ?? item.title;
    const newTitle = prompt("Update title", defaultTitle ?? item.title);
    if (!newTitle) return;

    const yearInput = prompt(
      "Release year (optional)",
      (item.customReleaseYear ?? item.autoReleaseYear ?? item.releaseYear ?? "")
        .toString()
        .replace("null", "")
    );
    let overrideYear: number | null = null;
    if (yearInput) {
      const parsed = Number.parseInt(yearInput, 10);
      if (!Number.isNaN(parsed)) {
        overrideYear = parsed;
      }
    }

    const typeInput = prompt(
      "Media type (movie, tv, music, game)",
      item.mediaType ?? "movie"
    );
    const normalizedType = (typeInput ?? "").trim().toLowerCase();
    const overrideMediaType =
      normalizedType === "movie" ||
      normalizedType === "tv" ||
      normalizedType === "music" ||
      normalizedType === "game"
        ? normalizedType
        : undefined;

    setFixingId(item.memoId);
    try {
      await onRefresh({
        memoId: item.memoId,
        overrideTitle: newTitle,
        overrideYear,
        overrideMediaType,
      });
    } catch (error) {
      console.error("Failed to fix match", error);
      alert("Unable to refresh media item. Please try again.");
    } finally {
      setFixingId(null);
    }
  };

  const handleRemove = async (item: MediaItem) => {
    if (!onRemove) return;
    const confirmed = confirm(
      `Remove “${item.title}” from the media library? This memo will no longer appear here.`
    );
    if (!confirmed) return;
    try {
      await onRemove(item.memoId);
    } catch (error) {
      console.error("Failed to remove media item", error);
      alert("Unable to remove media item. Please try again.");
    }
  };

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.mediaType === filter);
  }, [items, filter]);

  const providerLabel = (item: MediaItem) => {
    if (item.mediaType === "game") {
      return "Play on";
    }
    if (item.mediaType === "music") {
      return "Listen on";
    }
    if (item.mediaType === "book") {
      return "Read via";
    }
    return "Watch on";
  };

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
            const typeMeta =
              TYPE_META[(item.mediaType ?? "unknown") as MediaKind];
            const formattedTimeToBeat = formatTimeToBeat(
              item.timeToBeatMinutes
            );
            const TypeIcon = typeMeta.icon;
            const providerEntries = item.providers ?? item.platforms ?? [];
            const hasProviders = providerEntries.length > 0;
            const providerNames = providerEntries.slice(0, 3).join(", ");
            const providerOverflow = providerEntries.length > 3 ? "…" : "";
            const ratingsSummary = item.ratings
              ?.slice(0, 2)
              .map((rating) => `${rating.source}: ${rating.value}`)
              .join(" • ");

            return (
              <Card
                key={item.memoId}
                variant="elevated"
                className="group relative h-full overflow-hidden bg-gradient-to-br from-[#0f111f]/80 via-[#15192d]/70 to-[#1a1f33]/80"
              >
                {item.backdropUrl && (
                  <div className="absolute inset-0 opacity-30">
                    <Image
                      src={item.backdropUrl}
                      alt=""
                      fill
                      sizes="600px"
                      className="object-cover blur-sm"
                    />
                  </div>
                )}
                <div className="relative">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    {item.posterUrl ? (
                      <div className="relative h-20 w-14 overflow-hidden rounded-md border border-slate-700/30">
                        <Image
                          src={item.posterUrl}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-14 items-center justify-center rounded-md border border-slate-700/30 bg-slate-900/60 text-[10px] text-slate-500">
                        No art
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-white">
                          {item.title}
                        </CardTitle>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/40 bg-slate-900/60 text-slate-200">
                          <TypeIcon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          <span className="sr-only">{typeMeta.label}</span>
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {item.releaseYear ?? "Year unknown"}
                        {item.runtimeMinutes
                          ? ` • ${item.runtimeMinutes} min`
                          : ""}
                        {item.source && (
                          <span className="ml-2 uppercase tracking-wide text-[10px] text-slate-500">
                            {item.source}
                          </span>
                        )}
                      </p>
                      {item.genres && item.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                          {item.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full border border-slate-700/40 bg-slate-900/40 px-2 py-0.5"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {onRefresh && (
                    <button
                      type="button"
                      onClick={() =>
                        onRefresh({ memoId: item.memoId }).catch(
                          () => undefined
                        )
                      }
                      disabled={
                        refreshingId === item.memoId || fixingId === item.memoId
                      }
                      aria-label="Refresh metadata"
                      className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/40 bg-[#101525]/70 text-slate-300 transition hover:border-indigo-500/40 hover:text-white disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      {refreshingId === item.memoId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {onRefresh && (
                    <button
                      type="button"
                      onClick={() => handleFixMatch(item)}
                      disabled={
                        fixingId === item.memoId || refreshingId === item.memoId
                      }
                      aria-label="Fix match"
                      className="absolute right-4 top-14 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/40 bg-[#101525]/70 text-indigo-200 transition hover:border-indigo-500/40 hover:text-white disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      {fixingId === item.memoId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={removingId === item.memoId}
                      aria-label="Remove from media library"
                      className="absolute right-4 top-24 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-600/40 bg-rose-600/20 text-rose-100 transition hover:border-rose-400/40 hover:text-white disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      {removingId === item.memoId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    {item.overview && (
                      <p className="line-clamp-3 text-slate-300/90">
                        {item.overview}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {hasProviders && (
                        <span className="inline-flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" aria-hidden="true" />
                          {providerLabel(item)} {providerNames}
                          {providerOverflow}
                        </span>
                      )}

                      {ratingsSummary ? <span>{ratingsSummary}</span> : null}

                      {item.trailerUrl && (
                        <a
                          href={item.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-300 transition hover:text-indigo-200"
                        >
                          Trailer <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {formattedTimeToBeat && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" aria-hidden="true" />
                          {formattedTimeToBeat} to beat
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>
                {!item.posterUrl &&
                  !(item.providers?.length || item.platforms?.length) && (
                    <div className="relative border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[11px] text-amber-200">
                      Metadata is still sparse. Try refreshing to fetch art and
                      platform details.
                    </div>
                  )}
                <div className="flex items-center justify-between gap-2 border-t border-slate-700/30 bg-[#0a0f1c]/70 px-4 py-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Link
                      href={{ pathname: "/", hash: `memo-${item.memoId}` }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/40 text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
                      prefetch={false}
                      aria-label="View source memo"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/40 text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
                        aria-label="Open external entry"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {formattedTimeToBeat && (
                    <span className="hidden text-[10px] uppercase tracking-wide text-slate-500 sm:inline">
                      {formattedTimeToBeat}
                    </span>
                  )}
                </div>
                {item.searchDebug && (
                  <details className="border-t border-slate-700/20 bg-[#090d16]/60 px-4 py-2 text-[11px] text-slate-500">
                    <summary className="cursor-pointer text-slate-400">
                      Debug info
                    </summary>
                    <div className="mt-2 space-y-2">
                      {item.transcriptExcerpt && (
                        <div>
                          <span className="font-semibold text-slate-300">
                            Transcript excerpt:
                          </span>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {item.transcriptExcerpt}
                          </p>
                        </div>
                      )}
                      {item.tags.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-300">
                            Tags:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-indigo-200/80">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-indigo-500/10 px-2 py-0.5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid gap-1 text-[10px] text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-300">
                            Auto title:
                          </span>
                          <span className="text-slate-200">
                            {item.autoTitle ?? "—"}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-300">
                            Custom title:
                          </span>
                          <span className="text-indigo-200">
                            {item.customTitle ?? "—"}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-300">
                            Auto year:
                          </span>
                          <span className="text-slate-200">
                            {item.autoReleaseYear ?? "—"}
                          </span>
                          <span className="ml-2 font-semibold text-slate-300">
                            Custom year:
                          </span>
                          <span className="text-indigo-200">
                            {item.customReleaseYear ?? "—"}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-300">
                            Source:
                          </span>
                          <span className="uppercase text-slate-200">
                            {item.source ?? "—"}
                          </span>
                        </div>
                        {formattedTimeToBeat && (
                          <div>
                            <span className="font-semibold text-slate-300">
                              Time to beat:
                            </span>
                            <span className="text-slate-200">
                              {formattedTimeToBeat}
                            </span>
                          </div>
                        )}
                      </div>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-left text-[10px] text-slate-500">
                        {JSON.stringify(item.searchDebug, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
