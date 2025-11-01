"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../contexts/ToastContext";
import { ShoppingListItem } from "../types/enrichment";

interface UpdateShoppingItemPayload {
  memoId: string;
  status?: "open" | "purchased" | "archived";
  completedAt?: string | null;
}

export function useShoppingActions(username: string | null) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const updateShoppingItem = useCallback(
    async (payload: UpdateShoppingItemPayload) => {
      if (!username) {
        showError("Username is required");
        return;
      }

      try {
        const response = await fetch(`/api/shopping-list/${payload.memoId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: payload.status,
            completedAt: payload.completedAt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update item");
        }

        // Optimistically update React Query cache
        queryClient.setQueriesData<ShoppingListItem[]>(
          { queryKey: ["shopping-list", username] },
          (oldData) => {
            if (!oldData) return oldData;

            return oldData.map((item) => {
              if (item.memoId === payload.memoId) {
                return {
                  ...item,
                  status: payload.status ?? item.status,
                };
              }
              return item;
            });
          }
        );

        const statusMessage =
          payload.status === "purchased"
            ? "Item marked as purchased"
            : payload.status === "archived"
              ? "Item archived"
              : "Item updated";

        showSuccess(statusMessage);
      } catch (error) {
        showError(
          error instanceof Error
            ? `Failed to update item: ${error.message}`
            : "Failed to update item"
        );
        throw error;
      }
    },
    [username, queryClient, showSuccess, showError]
  );

  const markAsPurchased = useCallback(
    async (memoId: string) => {
      await updateShoppingItem({
        memoId,
        status: "purchased",
        completedAt: new Date().toISOString(),
      });
    },
    [updateShoppingItem]
  );

  const markAsArchived = useCallback(
    async (memoId: string) => {
      await updateShoppingItem({
        memoId,
        status: "archived",
        completedAt: null,
      });
    },
    [updateShoppingItem]
  );

  const markAsOpen = useCallback(
    async (memoId: string) => {
      await updateShoppingItem({
        memoId,
        status: "open",
        completedAt: null,
      });
    },
    [updateShoppingItem]
  );

  return {
    updateShoppingItem,
    markAsPurchased,
    markAsArchived,
    markAsOpen,
  };
}
