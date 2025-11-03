"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { MediaItem } from "../../types/enrichment";
import {
  Wand2,
  Trash2,
  ExternalLink,
  Eye,
  Gamepad2,
  Film,
  Tv,
  BookOpen,
  Music4,
  Sparkles,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MediaActionButton } from "./MediaActionButton";
import { useModals } from "../../contexts/ModalContext";

const TYPE_META: Record<string, { icon: LucideIcon; label: string }> = {
  movie: { icon: Film, label: "Movie" },
  tv: { icon: Tv, label: "TV" },
  game: { icon: Gamepad2, label: "Game" },
  book: { icon: BookOpen, label: "Book" },
  music: { icon: Music4, label: "Music" },
  unknown: { icon: Sparkles, label: "Media" },
};

interface MediaCardProps {
  item: MediaItem;
  formattedTimeToBeat: string | null;
  isDescriptionExpanded: boolean;
  isProvidersExpanded: boolean;
  onToggleDescription: () => void;
  onToggleProviders: () => void;
  onFixMatch?: () => void;
  onRemove?: () => void;
  onStatusChange?: (
    memoId: string,
    status: "to-watch" | "watched" | "backlog"
  ) => void;
  isFixing?: boolean;
  isRemoving?: boolean;
  isUpdatingStatus?: boolean;
  refreshingId?: string | null;
}

export function MediaCard({
  item,
  formattedTimeToBeat,
  isDescriptionExpanded,
  isProvidersExpanded,
  onToggleDescription,
  onToggleProviders,
  onFixMatch,
  onRemove,
  onStatusChange,
  isFixing = false,
  isRemoving = false,
  isUpdatingStatus = false,
  refreshingId,
}: MediaCardProps) {
  const { setShowMemoModal, setMemoModalId } = useModals();
  const typeMeta = TYPE_META[item.mediaType ?? "unknown"] ?? TYPE_META.unknown;
  const TypeIcon = typeMeta.icon;

  const handleViewMemo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("🔍 View memo clicked", {
      memoId: item.memoId,
      hasModals: !!setShowMemoModal && !!setMemoModalId,
    });
    try {
      setMemoModalId(item.memoId);
      setShowMemoModal(true);
      console.log("✅ Modal state set", { memoId: item.memoId });
    } catch (error) {
      console.error("❌ Error opening modal:", error);
    }
  };

  const providerEntries = item.providers ?? item.platforms ?? [];
  const hasProviders = providerEntries.length > 0;
  const displayedProviders = isProvidersExpanded
    ? providerEntries
    : providerEntries.slice(0, 3);
  const providerNames = displayedProviders.join(", ");
  const hasMoreProviders = providerEntries.length > 3;

  const providerLabel = () => {
    if (item.mediaType === "game") return "Play on";
    if (item.mediaType === "music") return "Listen on";
    if (item.mediaType === "book") return "Read via";
    return "Watch on";
  };

  const ratingsSummary = item.ratings
    ?.slice(0, 2)
    .map((rating) => `${rating.source}: ${rating.value}`)
    .join(" • ");

  return (
    <Card
      variant="elevated"
      className="group relative h-full overflow-hidden bg-gradient-to-br from-[#0f111f]/80 via-[#15192d]/70 to-[#1a1f33]/80"
    >
      {item.backdropUrl && (
        <div className="pointer-events-none absolute inset-0 opacity-30">
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
                <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">{typeMeta.label}</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {item.releaseYear ?? "Year unknown"}
              {item.mediaType === "game" && formattedTimeToBeat
                ? ` • ${formattedTimeToBeat}`
                : item.runtimeMinutes
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

        {/* Action Buttons */}
        <div className="absolute right-1 top-1 z-20 flex flex-col gap-2 opacity-100 lg:opacity-0 transition-opacity lg:group-hover:opacity-100 pointer-events-auto">
          {/* Status Actions */}
          {onStatusChange && (
            <>
              {item.status !== "watched" && (
                <MediaActionButton
                  icon={CheckCircle2}
                  label="Mark as watched"
                  onClick={() => onStatusChange(item.memoId, "watched")}
                  disabled={isUpdatingStatus}
                  isLoading={isUpdatingStatus}
                  variant="success"
                />
              )}
              {item.status !== "backlog" && item.status !== "watched" && (
                <MediaActionButton
                  icon={Archive}
                  label="Add to backlog"
                  onClick={() => onStatusChange(item.memoId, "backlog")}
                  disabled={isUpdatingStatus}
                  isLoading={isUpdatingStatus}
                  variant="default"
                />
              )}
              {item.status === "backlog" && (
                <MediaActionButton
                  icon={Clock}
                  label="Move to to-watch"
                  onClick={() => onStatusChange(item.memoId, "to-watch")}
                  disabled={isUpdatingStatus}
                  isLoading={isUpdatingStatus}
                  variant="default"
                />
              )}
              {item.status === "watched" && (
                <MediaActionButton
                  icon={Clock}
                  label="Move to to-watch"
                  onClick={() => onStatusChange(item.memoId, "to-watch")}
                  disabled={isUpdatingStatus}
                  isLoading={isUpdatingStatus}
                  variant="default"
                />
              )}
            </>
          )}
          {onFixMatch && (
            <MediaActionButton
              icon={Wand2}
              label="Fix match"
              onClick={onFixMatch}
              disabled={isFixing || refreshingId === item.memoId}
              isLoading={isFixing}
              variant="primary"
            />
          )}
          {onRemove && (
            <MediaActionButton
              icon={Trash2}
              label="Remove from media library"
              onClick={onRemove}
              disabled={isRemoving}
              isLoading={isRemoving}
              variant="danger"
            />
          )}
          <MediaActionButton
            icon={Eye}
            label="View source memo"
            onClick={handleViewMemo}
            variant="default"
          />
          {item.externalUrl && (
            <MediaActionButton
              icon={ExternalLink}
              label="Open external entry"
              href={item.externalUrl}
              variant="default"
            />
          )}
        </div>

        <CardContent className="space-y-3 text-sm text-slate-300 relative z-10">
          {item.overview && (
            <div>
              <p
                className={`text-slate-300/90 ${
                  isDescriptionExpanded ? "" : "line-clamp-3"
                }`}
              >
                {item.overview}
              </p>
              {/* Only show toggle if text is actually longer than what line-clamp-3 displays (~150-200 chars) */}
              {item.overview.length > 150 && (
                <button
                  type="button"
                  onClick={onToggleDescription}
                  className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {isDescriptionExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {/* Platforms on one line */}
          {hasProviders && (
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
              <span>{providerLabel()}</span>
              <span className="flex flex-wrap items-center gap-1">
                {providerNames}
                {hasMoreProviders && !isProvidersExpanded && "…"}
                {hasMoreProviders && (
                  <button
                    type="button"
                    onClick={onToggleProviders}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {isProvidersExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </span>
            </div>
          )}

          {/* Ratings and Trailer on separate line */}
          {(ratingsSummary || item.trailerUrl) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {ratingsSummary ? <span>{ratingsSummary}</span> : null}
              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-300 transition hover:text-indigo-200 cursor-pointer"
                >
                  Trailer <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </CardContent>
      </div>
      {!item.posterUrl &&
        !(item.providers?.length || item.platforms?.length) && (
          <div className="relative border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[11px] text-amber-200">
            Metadata is still sparse. Try using &quot;Fix match&quot; to fetch
            art and platform details.
          </div>
        )}
      {item.searchDebug && (
        <details className="mt-2 border-t border-slate-700/20 bg-[#090d16]/60 px-4 py-2 text-[11px] text-slate-500">
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
                <span className="font-semibold text-slate-300">Tags:</span>
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
                <span className="text-slate-200">{item.autoTitle ?? "—"}</span>
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
                <span className="font-semibold text-slate-300">Auto year:</span>
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
                <span className="font-semibold text-slate-300">Source:</span>
                <span className="uppercase text-slate-200">
                  {item.source ?? "—"}
                </span>
              </div>
              {formattedTimeToBeat && (
                <div>
                  <span className="font-semibold text-slate-300">
                    Time to beat:
                  </span>
                  <span className="text-slate-200">{formattedTimeToBeat}</span>
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
}
