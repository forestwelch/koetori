"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRequeueEnrichment(username: string | null) {
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

      const response = await fetch("/api/enrichment/requeue", {
        method: "POST",
        headers,
        body: JSON.stringify({ memoId }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to trigger enrichment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-items", username] });
      queryClient.invalidateQueries({ queryKey: ["reminders", username] });
      queryClient.invalidateQueries({ queryKey: ["shopping-list", username] });
    },
  });

  return {
    requeue: mutation.mutateAsync,
    isRequeueing: mutation.isPending,
  };
}
