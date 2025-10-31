"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveMediaItem(username: string | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (memoId: string) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = process.env.NEXT_PUBLIC_ENRICHMENT_TOKEN;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/enrichment/media/${memoId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete media item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-items", username] });
    },
  });

  return {
    removeMediaItem: mutation.mutateAsync,
    isRemoving: mutation.isPending,
  };
}
