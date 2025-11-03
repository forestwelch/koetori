"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Memo } from "../types/memo";

interface ModalContextType {
  // Search Modal
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Memo[];
  setSearchResults: (results: Memo[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;

  // Text Input Modal
  showTextInput: boolean;
  setShowTextInput: (show: boolean) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  isProcessingText: boolean;
  setIsProcessingText: (processing: boolean) => void;

  // Random Memo Modal
  showRandomMemo: boolean;
  setShowRandomMemo: (show: boolean) => void;
  randomMemo: Memo | null;
  setRandomMemo: (memo: Memo | null) => void;

  // Feedback Modal
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;

  // Settings Modal
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;

  // Camera Modal
  showCamera: boolean;
  setShowCamera: (show: boolean) => void;

  // Command Palette
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;

  // Memo Modal
  showMemoModal: boolean;
  setShowMemoModal: (show: boolean) => void;
  memoModalId: string | null;
  setMemoModalId: (id: string | null) => void;

  // Helper to close all modals
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Memo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Text Input
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);

  // Random Memo
  const [showRandomMemo, setShowRandomMemo] = useState(false);
  const [randomMemo, setRandomMemo] = useState<Memo | null>(null);

  // Feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // Settings
  const [showSettings, setShowSettings] = useState(false);

  // Camera
  const [showCamera, setShowCamera] = useState(false);

  // Command Palette
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Memo Modal
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoModalId, setMemoModalId] = useState<string | null>(null);

  const closeAllModals = () => {
    setShowSearch(false);
    setShowTextInput(false);
    setShowRandomMemo(false);
    setShowFeedback(false);
    setShowSettings(false);
    setShowCamera(false);
    setShowCommandPalette(false);
    setShowMemoModal(false);
    setMemoModalId(null);
  };

  return (
    <ModalContext.Provider
      value={{
        showSearch,
        setShowSearch,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        isSearching,
        setIsSearching,
        showTextInput,
        setShowTextInput,
        textInput,
        setTextInput,
        isProcessingText,
        setIsProcessingText,
        showRandomMemo,
        setShowRandomMemo,
        randomMemo,
        setRandomMemo,
        showFeedback,
        setShowFeedback,
        showSettings,
        setShowSettings,
        showCamera,
        setShowCamera,
        showCommandPalette,
        setShowCommandPalette,
        showMemoModal,
        setShowMemoModal,
        memoModalId,
        setMemoModalId,
        closeAllModals,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
