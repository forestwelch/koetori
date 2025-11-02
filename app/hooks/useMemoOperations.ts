"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Memo, Category } from "../types/memo";
import { MemoFilters } from "./useMemosQuery";
import { useToast } from "../contexts/ToastContext";
import { useFeedback } from "../contexts/FeedbackContext";

export function useMemoOperations(username: string, refetchMemos: () => void) {
  const { showSuccess, showError, showWarning } = useToast();
  const queryClient = useQueryClient();
  const { showFeedback } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [summaryEditText, setSummaryEditText] = useState("");
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

  const startEditSummary = useCallback((memo: Memo) => {
    setEditingSummaryId(memo.id);
    setSummaryEditText(memo.extracted?.what || "");
  }, []);

  const cancelEditSummary = useCallback(() => {
    setEditingSummaryId(null);
    setSummaryEditText("");
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
      // Also update inbox queries
      const inboxQueries = queryClient.getQueriesData<Memo[]>({
        queryKey: ["inbox-memos"],
      });
      inboxQueries.forEach(([key, data]) => {
        if (!data) return;
        const updated = updater(data, {} as MemoFilters);
        queryClient.setQueryData<Memo[]>(key, updated);
      });
    },
    [queryClient]
  );

  const getMemoSnapshot = useCallback(
    (id: string): Memo | undefined => {
      // Check both memos and inbox-memos queries
      const memosQueries = queryClient.getQueriesData<Memo[]>({
        queryKey: ["memos"],
      });
      for (const [, data] of memosQueries) {
        const found = data?.find((memo) => memo.id === id);
        if (found) {
          return found;
        }
      }

      const inboxQueries = queryClient.getQueriesData<Memo[]>({
        queryKey: ["inbox"],
      });
      for (const [, data] of inboxQueries) {
        const found = data?.find((memo) => memo.id === id);
        if (found) {
          return found;
        }
      }

      return undefined;
    },
    [queryClient]
  );

  const getMemoForFeedback = useCallback(
    async (id: string): Promise<Memo | null> => {
      const { data, error } = await supabase
        .from("memos")
        .select("*")
        .eq("id", id)
        .eq("username", username)
        .single();

      if (error || !data) return null;

      return {
        ...data,
        timestamp: new Date(data.timestamp),
      };
    },
    [username]
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
        // Get memo data for feedback
        const snapshot = getMemoSnapshot(id);
        const memoForFeedback = snapshot || (await getMemoForFeedback(id));

        setEditingId(null);
        setEditText("");
        const updated = snapshot
          ? { ...snapshot, transcript: editText, needs_review: false }
          : undefined;
        applyMemoSnapshot(updated);
        showSuccess("Memo saved");

        // Show feedback dialog
        if (memoForFeedback) {
          showFeedback({
            memoId: id,
            editType: "transcript",
            originalValue: snapshot?.transcript || null,
            newValue: editText,
            transcript: memoForFeedback.transcript,
            category: memoForFeedback.category,
            confidence: memoForFeedback.confidence,
            targetElement: (document.activeElement as HTMLElement) || null,
          });
        }
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
      getMemoForFeedback,
      showFeedback,
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

  const saveSummary = useCallback(
    async (id: string): Promise<void> => {
      const trimmedText = summaryEditText.trim();

      if (!trimmedText) {
        showWarning("Summary cannot be empty");
        return;
      }

      // Get current memo to check if it changed
      const { data: currentMemo } = await supabase
        .from("memos")
        .select("extracted")
        .eq("id", id)
        .single();

      const originalWhat = (currentMemo?.extracted as { what?: string })?.what;

      // If text hasn't changed, just exit
      if (originalWhat === trimmedText) {
        setEditingSummaryId(null);
        setSummaryEditText("");
        return;
      }

      // Update database first
      const currentExtracted =
        (currentMemo?.extracted as Record<string, unknown>) || {};
      const updatedExtracted = {
        ...currentExtracted,
        what: trimmedText,
      };

      const { error } = await supabase
        .from("memos")
        .update({ extracted: updatedExtracted })
        .eq("id", id)
        .eq("username", username);

      if (error) {
        showError(`Failed to update summary: ${error.message}`);
        return;
      }

      // Update React Query cache - update ALL queries that might contain this memo
      // Query keys are: ["memos", filters] and ["inbox", username]
      const updateMemo = (m: Memo) => {
        if (m.id === id) {
          return {
            ...m,
            extracted: m.extracted
              ? { ...m.extracted, what: trimmedText }
              : { what: trimmedText },
          };
        }
        return m;
      };

      // Update all memos queries (they have ["memos", filters] keys)
      queryClient.setQueriesData<Memo[]>({ queryKey: ["memos"] }, (oldData) =>
        oldData ? oldData.map(updateMemo) : oldData
      );

      // Update all inbox queries (they have ["inbox", username] keys)
      queryClient.setQueriesData<Memo[]>({ queryKey: ["inbox"] }, (oldData) =>
        oldData ? oldData.map(updateMemo) : oldData
      );

      // Clear editing state
      setEditingSummaryId(null);
      setSummaryEditText("");
      showSuccess("Summary saved");

      // Show feedback dialog
      const memoForFeedback = await getMemoForFeedback(id);
      if (memoForFeedback) {
        showFeedback({
          memoId: id,
          editType: "summary",
          originalValue: originalWhat || null,
          newValue: trimmedText,
          transcript: memoForFeedback.transcript,
          category: memoForFeedback.category,
          confidence: memoForFeedback.confidence,
          targetElement: (document.activeElement as HTMLElement) || null,
        });
      }
    },
    [
      summaryEditText,
      username,
      queryClient,
      showSuccess,
      showError,
      showWarning,
      getMemoForFeedback,
      showFeedback,
    ]
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

        // Show feedback dialog
        const memoForFeedback = snapshot || (await getMemoForFeedback(memoId));
        if (memoForFeedback) {
          showFeedback({
            memoId: memoId,
            editType: "category",
            originalValue: oldCategory,
            newValue: newCategory,
            transcript: memoForFeedback.transcript,
            category: memoForFeedback.category,
            confidence: memoForFeedback.confidence,
            targetElement: (document.activeElement as HTMLElement) || null,
          });
        }
      }
    },
    [
      username,
      getMemoSnapshot,
      applyMemoSnapshot,
      showSuccess,
      showError,
      getMemoForFeedback,
      showFeedback,
    ]
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
    editingSummaryId,
    summaryEditText,
    setSummaryEditText,
    newMemoId,
    setNewMemoId,
    expandedId,
    setExpandedId,
    startEdit,
    cancelEdit,
    saveEdit,
    startEditSummary,
    cancelEditSummary,
    saveSummary,
    softDelete,
    toggleStar,
    restoreMemo,
    hardDelete,
    handleCategoryChange,
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
