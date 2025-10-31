"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { MediaItem } from "../../types/enrichment";
import { Loader2, RefreshCw, Edit3, Trash2 } from "lucide-react";

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
  const [filter, setFilter] = useState<
    "all" | "movie" | "tv" | "game" | "book" | "music"
  >("all");

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
          {(["all", "movie", "tv", "game", "book", "music"] as const).map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-3 py-1 transition ${
                  filter === option
                    ? "bg-indigo-500/30 text-white shadow"
                    : "border border-slate-700/40 bg-slate-900/40 text-slate-300 hover:text-white"
                }`}
              >
                {option === "all" ? "All" : option.toUpperCase()}
              </button>
            )
          )}
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
          {filteredItems.map((item) => (
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
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-white">
                      {item.title}
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      {item.releaseYear ?? "Year unknown"}
                      {item.runtimeMinutes
                        ? ` • ${item.runtimeMinutes} min`
                        : ""}
                      {item.mediaType && item.mediaType !== "unknown"
                        ? ` • ${item.mediaType.toUpperCase()}`
                        : ""}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-indigo-200/80">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-indigo-500/20 px-2 py-0.5"
                          >
                            #{tag}
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
                      onRefresh({ memoId: item.memoId }).catch(() => undefined)
                    }
                    disabled={
                      refreshingId === item.memoId || fixingId === item.memoId
                    }
                    className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-slate-700/40 bg-[#101525]/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-indigo-500/40 hover:text-white disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    {refreshingId === item.memoId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Refresh
                  </button>
                )}
                {onRefresh && (
                  <button
                    type="button"
                    onClick={() => handleFixMatch(item)}
                    disabled={
                      fixingId === item.memoId || refreshingId === item.memoId
                    }
                    className="absolute right-4 top-12 inline-flex items-center gap-1 rounded-full border border-slate-700/40 bg-[#101525]/70 px-2 py-1 text-[11px] text-indigo-200 transition hover:border-indigo-500/40 hover:text-white disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    {fixingId === item.memoId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Edit3 className="h-3 w-3" />
                    )}
                    Fix match
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.memoId}
                    className="absolute right-4 top-20 inline-flex items-center gap-1 rounded-full border border-rose-600/40 bg-rose-600/20 px-2 py-1 text-[11px] text-rose-100 transition hover:border-rose-400/40 hover:text-white disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    {removingId === item.memoId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Remove
                  </button>
                )}
                <CardContent className="space-y-3 text-sm text-slate-300">
                  {item.overview && (
                    <p className="line-clamp-3 text-slate-300/90">
                      {item.overview}
                    </p>
                  )}

                  {item.transcriptExcerpt && (
                    <blockquote className="rounded-lg border border-slate-700/30 bg-slate-900/40 px-3 py-2 text-xs italic text-slate-400">
                      “{item.transcriptExcerpt}”
                    </blockquote>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {(item.providers?.length || item.platforms?.length) && (
                      <span>
                        {providerLabel(item)}{" "}
                        {(item.providers ?? item.platforms ?? [])
                          .slice(0, 3)
                          .join(", ")}
                        {(item.providers ?? item.platforms ?? []).length > 3
                          ? "…"
                          : ""}
                      </span>
                    )}

                    {item.ratings?.length ? (
                      <span>
                        {item.ratings
                          .slice(0, 2)
                          .map((rating) => `${rating.source}: ${rating.value}`)
                          .join(" • ")}
                      </span>
                    ) : null}

                    {item.trailerUrl && (
                      <a
                        href={item.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-300 transition-colors hover:text-indigo-200"
                      >
                        Trailer ↗
                      </a>
                    )}
                  </div>
                </CardContent>
              </div>
              {item.genres && item.genres.length > 0 && (
                <div className="relative border-t border-slate-700/30 bg-[#0f131f]/70 px-4 py-3 text-[11px] text-slate-400">
                  Genres: {item.genres.slice(0, 5).join(", ")}
                </div>
              )}
              {!item.posterUrl &&
                !(item.providers?.length || item.platforms?.length) && (
                  <div className="relative border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[11px] text-amber-200">
                    Metadata is still sparse. Try refreshing to fetch art and
                    streaming sources.
                  </div>
                )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/30 bg-[#0a0f1c]/70 px-4 py-3 text-[11px] text-slate-400">
                <div className="space-y-1">
                  <div>
                    Auto title:{" "}
                    <span className="text-slate-300">
                      {item.autoTitle ?? item.title}
                    </span>
                  </div>
                  {item.customTitle && (
                    <div>
                      Custom title:{" "}
                      <span className="text-indigo-200">
                        {item.customTitle}
                      </span>
                    </div>
                  )}
                  <div>
                    Auto year:{" "}
                    <span className="text-slate-300">
                      {item.autoReleaseYear ?? "—"}
                    </span>
                    {item.customReleaseYear && (
                      <span className="ml-2 text-indigo-200">
                        Custom year: {item.customReleaseYear}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={{ pathname: "/", hash: `memo-${item.memoId}` }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-700/40 px-3 py-1 text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
                  prefetch={false}
                >
                  View memo
                </Link>
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
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-left text-[10px] text-slate-500">
                      {JSON.stringify(item.searchDebug, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
