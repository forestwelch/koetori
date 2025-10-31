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
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
  });
}
