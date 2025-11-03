"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import {
  MediaItem,
  ReminderItem,
  ShoppingListItem,
  JournalItem,
  TarotItem,
  IdeaItem,
} from "../types/enrichment";

interface QueryOptions {
  enabled: boolean;
}

async function fetchMediaItems(username: string): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from("media_items")
    .select(
      `memo_id, title, release_year, runtime_minutes, poster_url, backdrop_url, overview, trailer_url, platforms, providers, genres, ratings, tmdb_id, imdb_id, media_type, auto_title, custom_title, auto_release_year, custom_release_year, search_debug, source, external_url, time_to_beat_minutes, status, updated_at, memos!inner(transcript_excerpt, tags, username)`
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
      status: (row.status as MediaItem["status"]) ?? "to-watch",
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
      `memo_id, item_name, quantity, category, urgency_score, status, items, display_order, updated_at, memos!inner(transcript_excerpt, username)`
    )
    .eq("memos.username", username)
    .order("status", { ascending: true })
    .order("display_order", { ascending: true })
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
      displayOrder: row.display_order ?? 0,
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

async function fetchJournalItems(username: string): Promise<JournalItem[]> {
  const { data, error } = await supabase
    .from("journal_items")
    .select(
      `memo_id, entry_text, themes, mood, created_at, updated_at, memos!inner(transcript_excerpt, tags, username)`
    )
    .eq("memos.username", username)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch journal items: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const memo = Array.isArray(row.memos) ? row.memos[0] : row.memos;
    const tags = Array.isArray(memo?.tags) ? memo.tags : [];
    const themes = Array.isArray(row.themes) ? row.themes : null;

    return {
      memoId: row.memo_id,
      entryText: row.entry_text,
      themes,
      mood: row.mood ?? null,
      transcriptExcerpt: memo?.transcript_excerpt ?? null,
      tags,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    } satisfies JournalItem;
  });
}

async function fetchTarotItems(username: string): Promise<TarotItem[]> {
  const { data, error } = await supabase
    .from("tarot_items")
    .select(
      `memo_id, card_name, card_type, suit, number, interpretation, reading_context, created_at, updated_at, memos!inner(transcript_excerpt, tags, username)`
    )
    .eq("memos.username", username)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch tarot items: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const memo = Array.isArray(row.memos) ? row.memos[0] : row.memos;
    const tags = Array.isArray(memo?.tags) ? memo.tags : [];

    return {
      memoId: row.memo_id,
      cardName: row.card_name,
      cardType: row.card_type as TarotItem["cardType"],
      suit: row.suit as TarotItem["suit"],
      number: row.number ?? null,
      interpretation: row.interpretation ?? null,
      readingContext: row.reading_context ?? null,
      transcriptExcerpt: memo?.transcript_excerpt ?? null,
      tags,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    } satisfies TarotItem;
  });
}

async function fetchIdeaItems(username: string): Promise<IdeaItem[]> {
  const { data, error } = await supabase
    .from("idea_items")
    .select(
      `memo_id, title, description, category, tags, status, created_at, updated_at, memos!inner(transcript_excerpt, tags, username)`
    )
    .eq("memos.username", username)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch idea items: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const memo = Array.isArray(row.memos) ? row.memos[0] : row.memos;
    const memoTags = Array.isArray(memo?.tags) ? memo.tags : [];
    const itemTags = Array.isArray(row.tags) ? row.tags : [];
    // Combine tags from both memo and item
    const tags = Array.from(new Set([...memoTags, ...itemTags]));

    return {
      memoId: row.memo_id,
      title: row.title,
      description: row.description ?? null,
      category: row.category ?? null,
      tags,
      status: (row.status as IdeaItem["status"]) ?? "new",
      transcriptExcerpt: memo?.transcript_excerpt ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    } satisfies IdeaItem;
  });
}

export function useJournalItems(
  username: string | null,
  options: QueryOptions
) {
  return useQuery({
    queryKey: ["journal-items", username],
    queryFn: () => fetchJournalItems(username ?? ""),
    enabled: options.enabled && Boolean(username),
    staleTime: 60 * 1000,
  });
}

export function useTarotItems(username: string | null, options: QueryOptions) {
  return useQuery({
    queryKey: ["tarot-items", username],
    queryFn: () => fetchTarotItems(username ?? ""),
    enabled: options.enabled && Boolean(username),
    staleTime: 60 * 1000,
  });
}

export function useIdeaItems(username: string | null, options: QueryOptions) {
  return useQuery({
    queryKey: ["idea-items", username],
    queryFn: () => fetchIdeaItems(username ?? ""),
    enabled: options.enabled && Boolean(username),
    staleTime: 60 * 1000,
  });
}
