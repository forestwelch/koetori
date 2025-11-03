"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo } from "../types/memo";

export function useRecentMemos(username: string | null, days: number = 1) {
  return useQuery({
    queryKey: ["recent-memos", username, days],
    queryFn: async () => {
      if (!username) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from("memos")
        .select("*")
        .eq("username", username)
        .is("deleted_at", null)
        .gte("timestamp", cutoffDate.toISOString())
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return (data || []).map((memo) => ({
        ...memo,
        timestamp: new Date(memo.timestamp),
      })) as Memo[];
    },
    enabled: Boolean(username),
    staleTime: 30 * 1000,
  });
}
