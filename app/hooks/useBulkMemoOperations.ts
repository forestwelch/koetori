"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Category } from "../types/memo";
import { useToast } from "../contexts/ToastContext";

export function useBulkMemoOperations(username: string) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const bulkArchive = useCallback(
    async (memoIds: string[]) => {
      try {
        const { error } = await supabase
          .from("memos")
          .update({ deleted_at: new Date().toISOString() })
          .in("id", memoIds);

        if (error) throw error;

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["inbox", username] });
        queryClient.invalidateQueries({ queryKey: ["memos"] });

        showSuccess(
          `${memoIds.length} memo${memoIds.length !== 1 ? "s" : ""} archived`
        );
        return true;
      } catch (error) {
        showError(
          error instanceof Error
            ? `Failed to archive: ${error.message}`
            : "Failed to archive memos"
        );
        return false;
      }
    },
    [username, queryClient, showSuccess, showError]
  );

  const bulkCategorize = useCallback(
    async (memoIds: string[], category: Category) => {
      try {
        const { error } = await supabase
          .from("memos")
          .update({ category })
          .in("id", memoIds);

        if (error) throw error;

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["inbox", username] });
        queryClient.invalidateQueries({ queryKey: ["memos"] });

        showSuccess(
          `${memoIds.length} memo${memoIds.length !== 1 ? "s" : ""} categorized as ${category}`
        );
        return true;
      } catch (error) {
        showError(
          error instanceof Error
            ? `Failed to categorize: ${error.message}`
            : "Failed to categorize memos"
        );
        return false;
      }
    },
    [username, queryClient, showSuccess, showError]
  );

  const bulkMarkReviewed = useCallback(
    async (memoIds: string[]) => {
      try {
        // Update needs_review to false for all selected memos
        const { error } = await supabase
          .from("memos")
          .update({ needs_review: false })
          .in("id", memoIds);

        if (error) throw error;

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["inbox", username] });
        queryClient.invalidateQueries({ queryKey: ["memos"] });

        showSuccess(
          `${memoIds.length} memo${memoIds.length !== 1 ? "s" : ""} marked as reviewed`
        );
        return true;
      } catch (error) {
        showError(
          error instanceof Error
            ? `Failed to mark reviewed: ${error.message}`
            : "Failed to mark memos as reviewed"
        );
        return false;
      }
    },
    [username, queryClient, showSuccess, showError]
  );

  return {
    bulkArchive,
    bulkCategorize,
    bulkMarkReviewed,
  };
}
