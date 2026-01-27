"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Memo, Category } from "../types/memo";

/**
 * Editing handlers that pages can provide to enable memo editing in modals
 */
export interface EditingHandlers {
  // Transcript editing
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;

  // Summary editing
  editingSummaryId: string | null;
  summaryEditText: string;
  setSummaryEditText: (text: string) => void;
  startEditSummary: (memo: Memo) => void;
  cancelEditSummary: () => void;
  saveSummary: (id: string) => void;

  // Memo operations
  softDelete: (id: string) => void;
  toggleStar: (id: string, current: boolean) => void;
  restoreMemo: (id: string, memoData?: Memo) => void;
  hardDelete: (id: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  dismissReview: (memoId: string) => void;
}

/**
 * Default no-op handlers for when no page has registered editing capabilities
 */
const defaultHandlers: EditingHandlers = {
  editingId: null,
  editText: "",
  setEditText: () => {},
  startEdit: () => {},
  cancelEdit: () => {},
  saveEdit: () => {},

  editingSummaryId: null,
  summaryEditText: "",
  setSummaryEditText: () => {},
  startEditSummary: () => {},
  cancelEditSummary: () => {},
  saveSummary: () => {},

  softDelete: () => {},
  toggleStar: () => {},
  restoreMemo: async () => {},
  hardDelete: async () => {},
  onCategoryChange: () => {},
  dismissReview: () => {},
};

interface EditingContextValue {
  handlersRef: React.MutableRefObject<EditingHandlers>;
  setHandlers: (handlers: EditingHandlers | null) => void;
}

const EditingContext = createContext<EditingContextValue | undefined>(
  undefined
);

export function EditingProvider({ children }: { children: ReactNode }) {
  // Use ref to store handlers - avoids re-renders when handlers update
  const handlersRef = useRef<EditingHandlers>(defaultHandlers);

  // Stable function that updates the ref without causing re-renders
  const setHandlers = useCallback((newHandlers: EditingHandlers | null) => {
    handlersRef.current = newHandlers || defaultHandlers;
  }, []);

  return (
    <EditingContext.Provider value={{ handlersRef, setHandlers }}>
      {children}
    </EditingContext.Provider>
  );
}

export function useEditing() {
  const context = useContext(EditingContext);
  if (context === undefined) {
    throw new Error("useEditing must be used within EditingProvider");
  }
  return context;
}

/**
 * Hook to get current editing handlers
 * Returns the current handlers from the ref
 */
export function useEditingHandlers(): EditingHandlers {
  const { handlersRef } = useEditing();
  return handlersRef.current;
}
