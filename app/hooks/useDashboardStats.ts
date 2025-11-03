"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import {
  useMediaItems,
  useReminders,
  useShoppingList,
  useJournalItems,
  useTarotItems,
  useIdeaItems,
  useTodoItems,
} from "./useEnrichmentData";
import { ReminderItem } from "../types/enrichment";
import { useReminderStats } from "./useReminderStats";

export interface DashboardStats {
  totalMemos: number;
  mediaCount: number;
  reminderCount: number;
  todoCount: number;
  journalCount: number;
  ideaCount: number;
  tarotCount: number;
  shoppingCount: number;
}

export function useDashboardStats(username: string | null) {
  const enabled = Boolean(username);

  const { data: mediaItems = [], isLoading: mediaLoading } = useMediaItems(
    username,
    { enabled }
  );
  const { data: reminders = [], isLoading: remindersLoading } = useReminders(
    username,
    { enabled }
  );
  const { data: shoppingItems = [], isLoading: shoppingLoading } =
    useShoppingList(username, { enabled });
  const { data: journalItems = [], isLoading: journalLoading } =
    useJournalItems(username, { enabled });
  const { data: tarotItems = [], isLoading: tarotLoading } = useTarotItems(
    username,
    { enabled }
  );
  const { data: ideas = [], isLoading: ideasLoading } = useIdeaItems(username, {
    enabled,
  });

  // Todos are memos that have todo_items
  const { data: todos = [], isLoading: todosLoading } = useTodoItems(username, {
    enabled,
  });

  const reminderStats = useReminderStats(reminders as ReminderItem[]);

  const { data: memos = [], isLoading: memosLoading } = useQuery({
    queryKey: ["memos", username],
    queryFn: async () => {
      if (!username) return [];
      const { data, error } = await supabase
        .from("memos")
        .select("id")
        .eq("username", username)
        .is("deleted_at", null);

      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(username),
  });

  const isLoading =
    mediaLoading ||
    remindersLoading ||
    todosLoading ||
    journalLoading ||
    ideasLoading ||
    tarotLoading ||
    shoppingLoading ||
    memosLoading;

  const stats: DashboardStats = {
    totalMemos: memos.length,
    mediaCount: mediaItems.length,
    reminderCount: reminders.length,
    todoCount: todos.length,
    journalCount: journalItems.length,
    ideaCount: ideas.length,
    tarotCount: tarotItems.length,
    shoppingCount: shoppingItems.length,
  };

  return { stats, reminderStats, isLoading };
}
