"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { EditType } from "../components/EditFeedbackDialog";

interface PendingFeedback {
  memoId: string;
  editType: EditType;
  originalValue: string | null;
  newValue: string | null;
  transcript?: string;
  category?: string;
  confidence?: number;
  targetElement?: HTMLElement | null; // Element that triggered the edit
}

interface FeedbackContextType {
  showFeedback: (feedback: PendingFeedback) => void;
  pendingFeedback: PendingFeedback | null;
  clearFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [pendingFeedback, setPendingFeedback] =
    useState<PendingFeedback | null>(null);

  const showFeedback = useCallback((feedback: PendingFeedback) => {
    setPendingFeedback(feedback);
  }, []);

  const clearFeedback = useCallback(() => {
    setPendingFeedback(null);
  }, []);

  return (
    <FeedbackContext.Provider
      value={{ showFeedback, pendingFeedback, clearFeedback }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
}
