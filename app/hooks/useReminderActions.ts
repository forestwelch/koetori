"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateReminderInput {
  memoId: string;
  status?: string;
  dueAt?: string | null;
  dueDateText?: string | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

interface UseReminderActionsOptions {
  username: string | null;
}

export function useReminderActions({ username }: UseReminderActionsOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: UpdateReminderInput) => {
      const response = await fetch(`/api/reminders/${input.memoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update reminder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", username] });
    },
  });

  return {
    updateReminder: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
