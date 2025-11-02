"use client";

import { useFeedback } from "../contexts/FeedbackContext";
import { EditFeedbackDialog, EditType } from "./EditFeedbackDialog";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import { useCallback } from "react";

export function EditFeedbackContainer() {
  const { pendingFeedback, clearFeedback } = useFeedback();
  const { username } = useUser();
  const { showSuccess } = useToast();

  const handleSubmit = useCallback(
    async (feedbackText: string) => {
      if (!pendingFeedback || !username) return;

      try {
        const response = await fetch("/api/memo-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memoId: pendingFeedback.memoId,
            username,
            editType: pendingFeedback.editType,
            originalValue: pendingFeedback.originalValue,
            newValue: pendingFeedback.newValue,
            feedbackText,
            transcript: pendingFeedback.transcript,
            category: pendingFeedback.category,
            confidence: pendingFeedback.confidence,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save feedback");
        }

        showSuccess("Feedback sent");
        clearFeedback();
      } catch (error) {
        // Silently fail - feedback is optional
        console.error("Failed to save feedback:", error);
        clearFeedback();
      }
    },
    [pendingFeedback, username, clearFeedback, showSuccess]
  );

  const handleSkip = useCallback(() => {
    clearFeedback();
  }, [clearFeedback]);

  if (!pendingFeedback) return null;

  return (
    <EditFeedbackDialog
      isOpen={!!pendingFeedback}
      editType={pendingFeedback.editType as EditType}
      originalValue={pendingFeedback.originalValue}
      newValue={pendingFeedback.newValue}
      targetElement={pendingFeedback.targetElement}
      onSkip={handleSkip}
      onSubmit={handleSubmit}
    />
  );
}
