"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo } from "../types/memo";

/**
 * Fetches memos for the inbox.
 *
 * Inbox shows memos that:
 * - Are not deleted (deleted_at IS NULL)
 * - Do NOT have any enrichment items (media_items, reminders, shopping_list_items, todo_items, etc.)
 * - Need user attention to be "enriched" or processed
 *
 * Once a memo has an enrichment item created, it's no longer in the inbox
 * because it has a "home" (media dashboard, reminders, shopping list, todos, etc.)
 */
async function fetchInboxMemos(username: string): Promise<Memo[]> {
  // First, get all non-deleted memos for this user
  const { data: allMemos, error: memosError } = await supabase
    .from("memos")
    .select("id, username")
    .eq("username", username)
    .is("deleted_at", null);

  if (memosError) {
    throw new Error(`Failed to fetch memos: ${memosError.message}`);
  }

  if (!allMemos || allMemos.length === 0) {
    return [];
  }

  const memoIds = allMemos.map((m) => m.id);

  // Check which memos have enrichment items (all enrichment tables)
  const [
    mediaResult,
    remindersResult,
    shoppingResult,
    todosResult,
    journalResult,
    tarotResult,
    ideaResult,
  ] = await Promise.all([
    supabase.from("media_items").select("memo_id").in("memo_id", memoIds),
    supabase.from("reminders").select("memo_id").in("memo_id", memoIds),
    supabase
      .from("shopping_list_items")
      .select("memo_id")
      .in("memo_id", memoIds),
    supabase.from("todo_items").select("memo_id").in("memo_id", memoIds),
    supabase.from("journal_items").select("memo_id").in("memo_id", memoIds),
    supabase.from("tarot_items").select("memo_id").in("memo_id", memoIds),
    supabase.from("idea_items").select("memo_id").in("memo_id", memoIds),
  ]);

  // Collect all memo IDs that have enrichment items
  const memosWithEnrichment = new Set([
    ...(mediaResult.data || []).map((item) => item.memo_id),
    ...(remindersResult.data || []).map((item) => item.memo_id),
    ...(shoppingResult.data || []).map((item) => item.memo_id),
    ...(todosResult.data || []).map((item) => item.memo_id),
    ...(journalResult.data || []).map((item) => item.memo_id),
    ...(tarotResult.data || []).map((item) => item.memo_id),
    ...(ideaResult.data || []).map((item) => item.memo_id),
  ]);

  // Now fetch full memo data for potential inbox memos
  const { data: memosData, error } = await supabase
    .from("memos")
    .select("*")
    .eq("username", username)
    .is("deleted_at", null)
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch inbox memos: ${error.message}`);
  }

  // Filter to only memos WITHOUT enrichment items
  // These are memos that haven't been "enriched" yet - they need user attention
  const inboxMemos = (memosData || []).filter(
    (memo) => !memosWithEnrichment.has(memo.id)
  );

  // Transform to Memo type
  return inboxMemos.map((memo) => ({
    ...memo,
    timestamp: new Date(memo.timestamp),
  }));
}

export function useInboxQuery(username: string | null) {
  return useQuery({
    queryKey: ["inbox", username],
    queryFn: () => fetchInboxMemos(username || ""),
    enabled: Boolean(username),
    staleTime: 30 * 1000, // 30s - frequently changing data (new memos, enrichments)
    gcTime: 5 * 60 * 1000, // 5min - keep in cache for quick navigation back
    retry: 2, // Retry failed requests twice before giving up
  });
}
