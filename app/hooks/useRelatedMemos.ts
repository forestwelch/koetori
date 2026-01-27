import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/app/lib/supabase";
import { Memo } from "@/app/types/memo";

/**
 * Hook to fetch all memos that share the same transcription_id
 * Used to display related memos in the full recording modal
 */
export function useRelatedMemos(transcriptionId: string | undefined) {
  return useQuery({
    queryKey: ["related-memos", transcriptionId],
    queryFn: async () => {
      if (!transcriptionId) {
        return [];
      }

      const { data, error } = await supabase
        .from("memos")
        .select("*")
        .eq("transcription_id", transcriptionId)
        .is("deleted_at", null) // Only non-deleted memos
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching related memos:", error);
        throw error;
      }

      // Transform timestamp strings to Date objects
      return (data || []).map((memo) => ({
        ...memo,
        timestamp: new Date(memo.timestamp),
      })) as Memo[];
    },
    enabled: !!transcriptionId, // Only run query if transcriptionId exists
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
  });
}
