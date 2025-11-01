"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { MediaItem, ReminderItem, ShoppingListItem } from "../types/enrichment";

interface QueryOptions {
  enabled: boolean;
}

async function fetchMediaItems(username: string): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from("media_items")
    .select(
      `memo_id, title, release_year, runtime_minutes, poster_url, backdrop_url, overview, trailer_url, platforms, providers, genres, ratings, tmdb_id, imdb_id, media_type, auto_title, custom_title, auto_release_year, custom_release_year, search_debug, source, external_url, time_to_beat_minutes, updated_at, memos!inner(transcript_excerpt, tags, username)`
    )
    .eq("memos.username", username)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Failed to fetch media items: ${error.message}`);
  }

  const items = (data ?? []).map((row) => {
    // Handle memos as either object or array (Supabase join can return either)
    const memo = Array.isArray(row.memos) ? row.memos[0] : row.memos;
    const tags = Array.isArray(memo?.tags) ? memo.tags : [];
    const platformsRaw = Array.isArray(row.platforms) ? row.platforms : [];
    const providersRaw = Array.isArray(row.providers) ? row.providers : [];

    const normalizedPlatforms = platformsRaw
      .map((platform) => (typeof platform === "string" ? platform.trim() : ""))
      .filter((platform) => platform.length > 0);
    const normalizedProviders = providersRaw
      .map((provider) => (typeof provider === "string" ? provider.trim() : ""))
      .filter((provider) => provider.length > 0);

    const title = row.title?.trim() ?? "Untitled";
    const releaseYear = row.release_year ?? null;
    const posterUrl =
      row.poster_url && row.poster_url !== "N/A" ? row.poster_url : null;
    const backdropUrl =
      row.backdrop_url && row.backdrop_url !== "N/A" ? row.backdrop_url : null;
    const trailerUrl =
      row.trailer_url && row.trailer_url !== "N/A" ? row.trailer_url : null;
    const genres = Array.isArray(row.genres)
      ? row.genres.filter(
          (genre: unknown): genre is string =>
            typeof genre === "string" && genre.length > 0
        )
      : null;
    const mediaTypeValue = row.media_type;
    const normalizedMediaType =
      mediaTypeValue &&
      ["movie", "tv", "music", "game", "book", "unknown"].includes(
        mediaTypeValue
      )
        ? (mediaTypeValue as MediaItem["mediaType"])
        : null;

    const overview = row.overview ?? null;

    // Debug logging for overview retrieval
    if (overview && normalizedMediaType === "game") {
      console.debug("[useEnrichmentData] loaded game overview from DB", {
        memoId: row.memo_id,
        title,
        overviewLength: overview.length,
        overviewPreview: overview.slice(0, 100),
      });
    }

    return {
      memoId: row.memo_id,
      title,
      releaseYear,
      runtimeMinutes: row.runtime_minutes,
      posterUrl,
      backdropUrl,
      overview,
      trailerUrl,
      platforms: normalizedPlatforms.length > 0 ? normalizedPlatforms : null,
      providers: normalizedProviders.length > 0 ? normalizedProviders : null,
      genres,
      ratings: Array.isArray(row.ratings) ? row.ratings : null,
      transcriptExcerpt: memo?.transcript_excerpt ?? null,
      tags,
      tmdbId: row.tmdb_id ?? null,
      imdbId: row.imdb_id ?? null,
      mediaType: normalizedMediaType,
      autoTitle: row.auto_title ?? title,
      customTitle: row.custom_title ?? null,
      autoReleaseYear: row.auto_release_year ?? releaseYear,
      customReleaseYear: row.custom_release_year ?? null,
      searchDebug: row.search_debug ?? null,
      source: (row.source as MediaItem["source"]) ?? null,
      externalUrl: row.external_url ?? null,
      timeToBeatMinutes: row.time_to_beat_minutes ?? null,
      updatedAt: new Date(row.updated_at),
    } satisfies MediaItem;
  });

  return items;
}

async function fetchReminders(username: string): Promise<ReminderItem[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select(
      `memo_id, title, due_date_text, recurrence_text, priority_score, status, is_recurring, due_at, recurrence_rule, updated_at, memos!inner(transcript_excerpt, username)`
    )
    .eq("memos.username", username)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error) {
    throw new Error(`Failed to fetch reminders: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    // Handle memos as either object or array (Supabase join can return either)
    const memo = Array.isArray(row.memos) ? row.memos[0] : row.memos;
    return {
      memoId: row.memo_id,
      title: row.title,
      dueDateText: row.due_date_text,
      recurrenceText: row.recurrence_text,
      priorityScore: row.priority_score,
      status: row.status,
      isRecurring: row.is_recurring ?? false,
      dueAt: row.due_at ?? null,
      recurrenceRule: row.recurrence_rule ?? null,
      transcriptExcerpt: memo?.transcript_excerpt ?? null,
      updatedAt: new Date(row.updated_at),
    } satisfies ReminderItem;
  });
}

async function fetchShoppingItems(
  username: string
): Promise<ShoppingListItem[]> {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select(
      `memo_id, item_name, quantity, category, urgency_score, status, items, updated_at, memos!inner(transcript_excerpt, username)`
    )
    .eq("memos.username", username)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error) {
    throw new Error(`Failed to fetch shopping list items: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    // Handle memos as either object or array (Supabase join can return either)
    const memo = Array.isArray(row.memos) ? row.memos[0] : row.memos;
    const parsedItems = Array.isArray(row.items)
      ? (row.items as string[]).filter((item) => typeof item === "string")
      : [];
    if (parsedItems.length === 0 && typeof row.item_name === "string") {
      parsedItems.push(row.item_name);
    }

    return {
      memoId: row.memo_id,
      itemName: row.item_name,
      quantity: row.quantity,
      category: row.category,
      urgencyScore: row.urgency_score,
      status: row.status,
      transcriptExcerpt: memo?.transcript_excerpt ?? null,
      items: parsedItems,
      updatedAt: new Date(row.updated_at),
    } satisfies ShoppingListItem;
  });
}

export function useMediaItems(username: string | null, options: QueryOptions) {
  return useQuery({
    queryKey: ["media-items", username],
    queryFn: () => fetchMediaItems(username ?? ""),
    enabled: options.enabled && Boolean(username),
    staleTime: 60 * 1000,
  });
}

export function useReminders(username: string | null, options: QueryOptions) {
  return useQuery({
    queryKey: ["reminders", username],
    queryFn: () => fetchReminders(username ?? ""),
    enabled: options.enabled && Boolean(username),
    staleTime: 30 * 1000,
  });
}

export function useShoppingList(
  username: string | null,
  options: QueryOptions
) {
  return useQuery({
    queryKey: ["shopping-list", username],
    queryFn: () => fetchShoppingItems(username ?? ""),
    enabled: options.enabled && Boolean(username),
    staleTime: 30 * 1000,
  });
}
