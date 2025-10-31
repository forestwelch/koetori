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
      `memo_id, title, release_year, runtime_minutes, poster_url, overview, trailer_url, platforms, ratings, updated_at, memos!inner(transcript_excerpt, tags, username)`
    )
    .eq("memos.username", username)
    .order("updated_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(`Failed to fetch media items: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const tags = Array.isArray(row.memos?.tags) ? row.memos.tags : [];

    return {
      memoId: row.memo_id,
      title: row.title,
      releaseYear: row.release_year,
      runtimeMinutes: row.runtime_minutes,
      posterUrl: row.poster_url,
      overview: row.overview,
      trailerUrl: row.trailer_url,
      platforms: Array.isArray(row.platforms) ? row.platforms : null,
      ratings: Array.isArray(row.ratings) ? row.ratings : null,
      transcriptExcerpt: row.memos?.transcript_excerpt ?? null,
      tags,
      updatedAt: new Date(row.updated_at),
    } satisfies MediaItem;
  });
}

async function fetchReminders(username: string): Promise<ReminderItem[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select(
      `memo_id, title, due_date_text, recurrence_text, priority_score, status, updated_at, memos!inner(transcript_excerpt, username)`
    )
    .eq("memos.username", username)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch reminders: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    return {
      memoId: row.memo_id,
      title: row.title,
      dueDateText: row.due_date_text,
      recurrenceText: row.recurrence_text,
      priorityScore: row.priority_score,
      status: row.status,
      transcriptExcerpt: row.memos?.transcript_excerpt ?? null,
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
      `memo_id, item_name, quantity, category, urgency_score, status, updated_at, memos!inner(transcript_excerpt, username)`
    )
    .eq("memos.username", username)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Failed to fetch shopping list items: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    return {
      memoId: row.memo_id,
      itemName: row.item_name,
      quantity: row.quantity,
      category: row.category,
      urgencyScore: row.urgency_score,
      status: row.status,
      transcriptExcerpt: row.memos?.transcript_excerpt ?? null,
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
