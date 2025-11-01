"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo, Category } from "../types/memo";
import { MemoFilters } from "./useMemosQuery";
import { useToast } from "../contexts/ToastContext";

export function useMemoOperations(username: string, refetchMemos: () => void) {
  const { showSuccess, showError, showWarning } = useToast();
  const queryClient = useQueryClient();
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

  const updateQueries = useCallback(
    (updater: (memos: Memo[], filters: MemoFilters) => Memo[]) => {
      const queries = queryClient.getQueriesData<Memo[]>({
        queryKey: ["memos"],
      });
      queries.forEach(([key, data]) => {
        if (!data) return;
        const [, filters] = key as [string, MemoFilters];
        const next = updater(data, filters);
        queryClient.setQueryData<Memo[]>(key, next);
      });
    },
    [queryClient]
  );

  const getMemoSnapshot = useCallback(
    (id: string): Memo | undefined => {
      const queries = queryClient.getQueriesData<Memo[]>({
        queryKey: ["memos"],
      });
      for (const [, data] of queries) {
        const found = data?.find((memo) => memo.id === id);
        if (found) {
          return found;
        }
      }
      return undefined;
    },
    [queryClient]
  );

  const applyMemoSnapshot = useCallback(
    (memo: Memo | undefined) => {
      if (!memo) {
        refetchMemos();
        return;
      }
      updateQueries((memos, filters) => {
        const shouldExist = matchesFilters(memo, filters) && !memo.deleted_at;
        const index = memos.findIndex((m) => m.id === memo.id);

        if (shouldExist) {
          if (index === -1) {
            return [memo, ...memos];
          }
          const next = [...memos];
          next[index] = memo;
          return next;
        }

        if (index !== -1) {
          const next = [...memos];
          next.splice(index, 1);
          return next;
        }

        return memos;
      });
    },
    [updateQueries, refetchMemos]
  );

  const saveEdit = useCallback(
    async (id: string): Promise<void> => {
      if (!editText.trim()) {
        showWarning("Memo content cannot be empty");
        return;
      }

      // Get current memo to check if it needs review
      const { data: memo } = await supabase
        .from("memos")
        .select("needs_review")
        .eq("id", id)
        .single();

      const updateData: { transcript: string; needs_review?: boolean } = {
        transcript: editText,
      };

      // Auto-dismiss review when memo is edited
      if (memo?.needs_review) {
        updateData.needs_review = false;
      }

      const { error } = await supabase
        .from("memos")
        .update(updateData)
        .eq("id", id)
        .eq("username", username);

      if (error) {
        showError(`Failed to update memo: ${error.message}`);
      } else {
        setEditingId(null);
        setEditText("");
        const snapshot = getMemoSnapshot(id);
        const updated = snapshot
          ? { ...snapshot, transcript: editText, needs_review: false }
          : undefined;
        applyMemoSnapshot(updated);
        showSuccess("Memo saved");
      }
    },
    [
      editText,
      username,
      getMemoSnapshot,
      applyMemoSnapshot,
      showSuccess,
      showError,
      showWarning,
    ]
  );

  const softDelete = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("memos")
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        showError(`Failed to archive memo: ${error.message}`);
      } else {
        const snapshot = getMemoSnapshot(id);
        const now = new Date();
        applyMemoSnapshot(
          snapshot ? { ...snapshot, deleted_at: now } : undefined
        );
        showSuccess("Memo archived");
      }
    },
    [username, getMemoSnapshot, applyMemoSnapshot, showSuccess, showError]
  );

  const toggleStar = useCallback(
    async (id: string, currentStarred: boolean): Promise<void> => {
      const { error } = await supabase
        .from("memos")
        .update({
          starred: !currentStarred,
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        showError(
          `Failed to ${!currentStarred ? "star" : "unstar"} memo: ${error.message}`
        );
      } else {
        const snapshot = getMemoSnapshot(id);
        const updated = snapshot
          ? { ...snapshot, starred: !currentStarred }
          : undefined;
        applyMemoSnapshot(updated);
        showSuccess(!currentStarred ? "Memo starred" : "Memo unstarred");
      }
    },
    [username, getMemoSnapshot, applyMemoSnapshot, showSuccess, showError]
  );

  const restoreMemo = useCallback(
    async (id: string, memoData?: Memo): Promise<void> => {
      const { error } = await supabase
        .from("memos")
        .update({
          deleted_at: null,
        })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        showError(`Failed to restore memo: ${error.message}`);
      } else {
        if (memoData) {
          applyMemoSnapshot({ ...memoData, deleted_at: null });
        } else {
          const snapshot = getMemoSnapshot(id);
          applyMemoSnapshot(
            snapshot ? { ...snapshot, deleted_at: null } : undefined
          );
        }
        showSuccess("Memo restored");
      }
    },
    [username, applyMemoSnapshot, getMemoSnapshot, showSuccess, showError]
  );

  const hardDelete = useCallback(
    async (id: string): Promise<void> => {
      if (!confirm("Permanently delete this memo? This cannot be undone.")) {
        return;
      }

      const { error } = await supabase
        .from("memos")
        .delete()
        .eq("id", id)
        .eq("username", username);

      if (error) {
        showError(`Failed to delete memo: ${error.message}`);
      } else {
        const snapshot = getMemoSnapshot(id);
        const now = new Date();
        applyMemoSnapshot(
          snapshot ? { ...snapshot, deleted_at: now } : undefined
        );
        showSuccess("Memo deleted permanently");
      }
    },
    [username, getMemoSnapshot, applyMemoSnapshot, showSuccess, showError]
  );

  const handleCategoryChange = useCallback(
    async (
      memoId: string,
      newCategory: Category,
      oldCategory: Category
    ): Promise<void> => {
      if (newCategory === oldCategory) return;

      // Get current memo to check if it needs review
      const { data: memo } = await supabase
        .from("memos")
        .select("needs_review")
        .eq("id", memoId)
        .single();

      const updateData: { category: Category; needs_review?: boolean } = {
        category: newCategory,
      };

      // Auto-dismiss review when category is changed
      if (memo?.needs_review) {
        updateData.needs_review = false;
      }

      const { error } = await supabase
        .from("memos")
        .update(updateData)
        .eq("id", memoId)
        .eq("username", username);

      if (error) {
        showError(`Failed to update category: ${error.message}`);
      } else {
        const snapshot = getMemoSnapshot(memoId);
        applyMemoSnapshot(
          snapshot
            ? { ...snapshot, category: newCategory, needs_review: false }
            : undefined
        );
        showSuccess(`Category changed to ${newCategory}`);
      }
    },
    [username, getMemoSnapshot, applyMemoSnapshot, showSuccess, showError]
  );

  const handleSizeChange = useCallback(
    async (memoId: string, newSize: "S" | "M" | "L" | null): Promise<void> => {
      const { error } = await supabase
        .from("memos")
        .update({
          size: newSize,
        })
        .eq("id", memoId)
        .eq("username", username);

      if (error) {
        showError(`Failed to update size: ${error.message}`);
      } else {
        const snapshot = getMemoSnapshot(memoId);
        applyMemoSnapshot(
          snapshot ? { ...snapshot, size: newSize ?? undefined } : undefined
        );
        showSuccess(`Size changed to ${newSize || "auto"}`);
      }
    },
    [username, getMemoSnapshot, applyMemoSnapshot, showSuccess, showError]
  );

  const dismissReview = useCallback(
    async (memoId: string): Promise<void> => {
      const { error } = await supabase
        .from("memos")
        .update({
          needs_review: false,
        })
        .eq("id", memoId)
        .eq("username", username);

      if (error) {
        showError(`Failed to dismiss review: ${error.message}`);
      } else {
        const snapshot = getMemoSnapshot(memoId);
        applyMemoSnapshot(
          snapshot ? { ...snapshot, needs_review: false } : undefined
        );
        showSuccess("Review dismissed");
      }
    },
    [username, getMemoSnapshot, applyMemoSnapshot, showSuccess, showError]
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
    dismissReview,
  };
}

function matchesFilters(memo: Memo, filters: MemoFilters) {
  if (memo.deleted_at) return false;
  if (
    filters.categoryFilter !== "all" &&
    memo.category !== filters.categoryFilter
  ) {
    return false;
  }
  if (filters.sizeFilter !== "all") {
    if ((memo.size ?? "all") !== filters.sizeFilter) {
      return false;
    }
  }
  if (filters.starredOnly && !memo.starred) {
    return false;
  }
  return true;
}
