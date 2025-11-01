"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo } from "../types/memo";

async function fetchInboxMemos(username: string): Promise<Memo[]> {
  // Query memos that are unprocessed:
  // 1. enrichment_processed_at IS NULL (never processed)
  // 2. OR enrichment_processed_at IS NOT NULL BUT no enrichment items exist

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

  // Check which memos have enrichment items
  const [mediaResult, remindersResult, shoppingResult] = await Promise.all([
    supabase.from("media_items").select("memo_id").in("memo_id", memoIds),
    supabase.from("reminders").select("memo_id").in("memo_id", memoIds),
    supabase
      .from("shopping_list_items")
      .select("memo_id")
      .in("memo_id", memoIds),
  ]);

  const mediaMemoIds = new Set(
    (mediaResult.data || []).map((item) => item.memo_id)
  );
  const reminderMemoIds = new Set(
    (remindersResult.data || []).map((item) => item.memo_id)
  );
  const shoppingMemoIds = new Set(
    (shoppingResult.data || []).map((item) => item.memo_id)
  );

  // Memos that have been processed and have enrichment items
  const processedWithEnrichment = new Set([
    ...mediaMemoIds,
    ...reminderMemoIds,
    ...shoppingMemoIds,
  ]);

  // Now fetch full memo data for unprocessed memos
  // A memo is unprocessed if:
  // - enrichment_processed_at IS NULL, OR
  // - enrichment_processed_at IS NOT NULL but has no enrichment items
  const { data: memosData, error } = await supabase
    .from("memos")
    .select("*")
    .eq("username", username)
    .is("deleted_at", null)
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch inbox memos: ${error.message}`);
  }

  // Filter to only unprocessed memos
  const unprocessedMemos = (memosData || []).filter((memo) => {
    // If never processed, include it
    if (!memo.enrichment_processed_at) {
      return true;
    }

    // If processed but no enrichment items created, include it (needs manual action)
    if (!processedWithEnrichment.has(memo.id)) {
      return true;
    }

    // Otherwise, it's processed and has enrichment items - exclude from inbox
    return false;
  });

  // Transform to Memo type
  return unprocessedMemos.map((memo) => ({
    ...memo,
    timestamp: new Date(memo.timestamp),
  }));
}

export function useInboxQuery(username: string | null) {
  return useQuery({
    queryKey: ["inbox", username],
    queryFn: () => fetchInboxMemos(username || ""),
    enabled: Boolean(username),
    staleTime: 30 * 1000, // 30 seconds
  });
}
