"use client";

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Memo, Category } from "../types/memo";

export function useMemoOperations(username: string, refetchMemos: () => void) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newMemoId, setNewMemoId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startEdit = useCallback((memo: Memo) => {
    setEditingId(memo.id);
    setEditText(memo.transcript);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText("");
  }, []);

  const saveEdit = useCallback(
    async (id: string) => {
      if (!editText.trim()) {
        alert("Memo content cannot be empty");
        return;
      }

      const { error } = await supabase
        .from("memos")
        .update({
          transcript: editText,
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Error updating memo:", error);
        alert("Failed to update memo");
      } else {
        setEditingId(null);
        setEditText("");
        refetchMemos();
      }
    },
    [editText, username, refetchMemos]
  );

  const softDelete = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("memos")
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Error archiving memo:", error);
        alert("Failed to archive memo");
      } else {
        refetchMemos();
      }
    },
    [username, refetchMemos]
  );

  const toggleStar = useCallback(
    async (id: string, currentStarred: boolean) => {
      const { error } = await supabase
        .from("memos")
        .update({
          starred: !currentStarred,
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Error updating star:", error);
        alert("Failed to update star");
      } else {
        await refetchMemos();
      }
    },
    [username, refetchMemos]
  );

  const restoreMemo = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("memos")
        .update({
          deleted_at: null,
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Error restoring memo:", error);
        alert("Failed to restore memo");
      } else {
        refetchMemos();
      }
    },
    [username, refetchMemos]
  );

  const hardDelete = useCallback(
    async (id: string) => {
      if (!confirm("Permanently delete this memo? This cannot be undone.")) {
        return;
      }

      const { error } = await supabase
        .from("memos")
        .delete()
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Error deleting memo:", error);
        alert("Failed to delete memo");
      } else {
        refetchMemos();
      }
    },
    [username, refetchMemos]
  );

  const handleCategoryChange = useCallback(
    async (memoId: string, newCategory: Category, oldCategory: Category) => {
      if (newCategory === oldCategory) return;

      const { error } = await supabase
        .from("memos")
        .update({
          category: newCategory,
        })
        .eq("id", memoId)
        .eq("username", username);

      if (error) {
        console.error("Error updating category:", error);
        alert("Failed to update category");
      } else {
        refetchMemos();
      }
    },
    [username, refetchMemos]
  );

  const handleSizeChange = useCallback(
    async (memoId: string, newSize: "S" | "M" | "L" | null) => {
      const { error } = await supabase
        .from("memos")
        .update({
          size: newSize,
        })
        .eq("id", memoId)
        .eq("username", username);

      if (error) {
        console.error("Error updating size:", error);
        alert("Failed to update size");
      } else {
        refetchMemos();
      }
    },
    [username, refetchMemos]
  );

  return {
    editingId,
    editText,
    setEditText,
    newMemoId,
    setNewMemoId,
    expandedId,
    setExpandedId,
    startEdit,
    cancelEdit,
    saveEdit,
    softDelete,
    toggleStar,
    restoreMemo,
    hardDelete,
    handleCategoryChange,
    handleSizeChange,
  };
}
