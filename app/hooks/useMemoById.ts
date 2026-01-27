import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo } from "../types/memo";

/**
 * Hook to fetch a single memo by ID
 */
export function useMemoById(memoId: string | null, username: string | null) {
  return useQuery({
    queryKey: ["memo", memoId],
    queryFn: async () => {
      if (!memoId || !username) {
        return null;
      }

      const { data, error } = await supabase
        .from("memos")
        .select("*")
        .eq("id", memoId)
        .eq("username", username)
        .is("deleted_at", null)
        .single();

      if (error) {
        console.error("Error fetching memo:", error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        timestamp: new Date(data.timestamp),
      } as Memo;
    },
    enabled: !!memoId && !!username,
    staleTime: 30 * 1000, // 30s - single memo may be edited frequently
    gcTime: 5 * 60 * 1000, // 5min - keep in cache for quick navigation
    retry: 2, // Retry failed requests twice before giving up
  });
}
