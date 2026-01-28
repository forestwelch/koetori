"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo } from "../types/memo";

/**
 * Fetches memos that were archived (soft deleted) in the last 24 hours.
 * Used on the inbox page to show recently processed memos for verification.
 */
async function fetchRecentlyArchivedMemos(username: string): Promise<Memo[]> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .eq("username", username)
    .not("deleted_at", "is", null) // Only archived memos
    .gte("deleted_at", twentyFourHoursAgo.toISOString()) // Last 24 hours
    .order("deleted_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(
      `Failed to fetch recently archived memos: ${error.message}`
    );
  }

  // Transform to Memo type
  return (data || []).map((memo) => ({
    ...memo,
    timestamp: new Date(memo.timestamp),
    deleted_at: memo.deleted_at ? new Date(memo.deleted_at) : null,
  }));
}

export function useRecentlyArchivedMemos(username: string | null) {
  return useQuery({
    queryKey: ["recently-archived", username],
    queryFn: () => fetchRecentlyArchivedMemos(username || ""),
    enabled: Boolean(username),
    staleTime: 30 * 1000, // 30s - refresh frequently to see new archives
    gcTime: 2 * 60 * 1000, // 2min - short cache for recent activity
    retry: 2,
  });
}
