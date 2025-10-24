"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useModals } from "../contexts/ModalContext";

export function useSearch(username: string) {
  const { searchQuery, setSearchResults, setIsSearching } = useModals();

  useEffect(() => {
    if (!searchQuery.trim() || !username) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchMemos = async () => {
      // Normalize search query - trim and collapse multiple spaces
      const normalizedQuery = searchQuery.trim().replace(/\s+/g, " ");

      const { data, error } = await supabase
        .from("memos")
        .select("*")
        .eq("username", username)
        .is("deleted_at", null)
        .ilike("transcript", `%${normalizedQuery}%`)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else {
        // Transform the data to match Memo type
        const transformedData = (data || []).map((memo) => ({
          ...memo,
          timestamp: new Date(memo.timestamp),
        }));
        setSearchResults(transformedData);
      }
      setIsSearching(false);
    };

    // Debounce search
    const timer = setTimeout(searchMemos, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, username, setSearchResults, setIsSearching]);
}
