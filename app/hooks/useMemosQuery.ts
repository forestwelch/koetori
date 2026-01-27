"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo, Category } from "../types/memo";

export interface MemoFilters {
  username: string;
  categoryFilter: Category | "all";
  starredOnly: boolean;
}

async function fetchMemos(filters: MemoFilters): Promise<Memo[]> {
  let query = supabase
    .from("memos")
    .select("*")
    .eq("username", filters.username)
    .is("deleted_at", null); // Only show non-deleted memos

  // Apply starred filter
  if (filters.starredOnly) {
    query = query.eq("starred", true);
  }

  // Apply category filter
  if (filters.categoryFilter !== "all") {
    query = query.eq("category", filters.categoryFilter);
  }

  const { data, error } = await query;

  // Sort: review items first, then by timestamp
  if (data) {
    data.sort((a, b) => {
      // Review items always come first
      if (a.needs_review && !b.needs_review) return -1;
      if (!a.needs_review && b.needs_review) return 1;
      // Then by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  if (error) {
    throw new Error(`Failed to fetch memos: ${error.message}`);
  }

  // Transform database records to Memo type
  const transformedData = (data || []).map((memo) => ({
    ...memo,
    timestamp: new Date(memo.timestamp),
  }));

  return transformedData;
}

export function useMemosQuery(filters: MemoFilters) {
  return useQuery({
    queryKey: ["memos", filters],
    queryFn: () => fetchMemos(filters),
    enabled: !!filters.username,
    staleTime: 30 * 1000, // 30s - frequently changing data (edits, filters, new memos)
    gcTime: 5 * 60 * 1000, // 5min - keep filtered results in cache
    retry: 2, // Retry failed requests twice before giving up
  });
}
