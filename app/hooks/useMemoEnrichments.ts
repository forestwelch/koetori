"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContext";

interface EnrichmentLinks {
  hasMedia: boolean;
  hasReminder: boolean;
  hasShopping: boolean;
  hasTodo: boolean;
  hasJournal: boolean;
  hasTarot: boolean;
  hasIdea: boolean;
}

async function fetchEnrichmentLinks(
  memoId: string,
  username: string
): Promise<EnrichmentLinks> {
  // Check all enrichment tables in parallel
  const [media, reminder, shopping, todo, journal, tarot, idea] =
    await Promise.all([
      supabase.from("media_items").select("id").eq("memo_id", memoId).single(),
      supabase.from("reminders").select("id").eq("memo_id", memoId).single(),
      supabase
        .from("shopping_list_items")
        .select("id")
        .eq("memo_id", memoId)
        .single(),
      supabase.from("todo_items").select("id").eq("memo_id", memoId).single(),
      supabase
        .from("journal_items")
        .select("id")
        .eq("memo_id", memoId)
        .single(),
      supabase.from("tarot_items").select("id").eq("memo_id", memoId).single(),
      supabase.from("idea_items").select("id").eq("memo_id", memoId).single(),
    ]);

  return {
    hasMedia: !!media.data,
    hasReminder: !!reminder.data,
    hasShopping: !!shopping.data,
    hasTodo: !!todo.data,
    hasJournal: !!journal.data,
    hasTarot: !!tarot.data,
    hasIdea: !!idea.data,
  };
}

export function useMemoEnrichments(memoId: string | null) {
  const { username } = useUser();

  return useQuery({
    queryKey: ["memo-enrichments", memoId, username],
    queryFn: () => fetchEnrichmentLinks(memoId || "", username || ""),
    enabled: Boolean(memoId && username),
    staleTime: 60 * 1000, // 60s - enrichment links don't change often
    gcTime: 10 * 60 * 1000, // 10min - keep enrichment info cached longer
    retry: 2, // Retry failed requests twice before giving up
  });
}
