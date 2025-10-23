"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo, Category } from "../types/memo";

interface MemoFilters {
  username: string;
  filter: "all" | "review" | "archive" | "starred";
  categoryFilter: Category | "all";
  sizeFilter: "S" | "M" | "L" | "all";
}

async function fetchMemos(filters: MemoFilters): Promise<Memo[]> {
  let query = supabase
    .from("memos")
    .select("*")
    .eq("username", filters.username)
    .order("timestamp", { ascending: false });

  // Apply filters
  if (filters.filter === "archive") {
    query = query.not("deleted_at", "is", null);
  } else if (filters.filter === "starred") {
    query = query.eq("starred", true).is("deleted_at", null);
  } else if (filters.filter === "review") {
    query = query.eq("needs_review", true).is("deleted_at", null);
  } else {
    // "all" - only show non-deleted memos
    query = query.is("deleted_at", null);
  }

  if (filters.categoryFilter !== "all") {
    query = query.eq("category", filters.categoryFilter);
  }

  if (filters.sizeFilter !== "all") {
    query = query.eq("size", filters.sizeFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch memos: ${error.message}`);
  }

  return data || [];
}

export function useMemosQuery(filters: MemoFilters) {
  return useQuery({
    queryKey: ["memos", filters],
    queryFn: () => fetchMemos(filters),
    enabled: !!filters.username, // Only fetch when we have a username
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}
