"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { MediaItem } from "../../types/enrichment";

interface MediaLibraryProps {
  items: MediaItem[];
  isLoading: boolean;
  error?: Error | null;
}

export function MediaLibrary({ items, isLoading, error }: MediaLibraryProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Media Library</h2>
          <p className="text-sm text-slate-400">
            Automatically enriched movies, shows, books, and more.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          Loading media…
        </div>
      ) : error ? (
        <div className="text-sm text-rose-400">
          Failed to load media items: {error.message}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500">
          No media enrichments yet. Capture a memo with a film, show, or book to
          see it here.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.memoId}
              variant="elevated"
              className="h-full overflow-hidden bg-gradient-to-br from-[#0f111f]/80 via-[#15192d]/70 to-[#1a1f33]/80"
            >
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
                  <div className="flex h-20 w-14 items-center justify-center rounded-md border border-slate-700/30 bg-slate-900/60 text-xs text-slate-500">
                    No art
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-white">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-slate-400">
                    {item.releaseYear ?? "Year unknown"}
                    {item.runtimeMinutes ? ` • ${item.runtimeMinutes} min` : ""}
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
                  {item.platforms?.length ? (
                    <span>
                      Watch on {item.platforms.slice(0, 3).join(", ")}
                      {item.platforms.length > 3 ? "…" : ""}
                    </span>
                  ) : null}

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
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
