"use client";

import { useEffect } from "react";
import { useFilters } from "../contexts/FilterContext";
import { useModals } from "../contexts/ModalContext";
import { Category } from "../types/memo";

interface UseKeyboardShortcutsProps {
  onRecordToggle: () => void;
  onPickRandomMemo: () => void;
  onCancelRecording: () => void;
  isRecording: boolean;
  editingId: string | null;
  cancelEdit: () => void;
}

export function useKeyboardShortcuts({
  onRecordToggle,
  onPickRandomMemo,
  onCancelRecording,
  isRecording,
  editingId,
  cancelEdit,
}: UseKeyboardShortcutsProps) {
  const {
    categoryFilter,
    setCategoryFilter,
    sizeFilter,
    setSizeFilter,
    starredOnly,
    setStarredOnly,
    resetFilters,
    isSpotlightMode,
    setIsSpotlightMode,
  } = useFilters();

  const {
    showSettings,
    setShowSettings,
    showTextInput,
    setShowTextInput,
    textInput,
    setTextInput,
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    showRandomMemo,
    setShowRandomMemo,
    showCommandPalette,
    setShowCommandPalette,
  } = useModals();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        editingId !== null;

      const isModalOpen =
        showSettings ||
        showTextInput ||
        showSearch ||
        showRandomMemo ||
        showCommandPalette ||
        isSpotlightMode;

      // Helper to check if only specified modifiers are pressed
      const hasOnlyModifiers = (
        alt = false,
        meta = false,
        ctrl = false,
        shift = false
      ) =>
        e.altKey === alt &&
        e.metaKey === meta &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift;

      // Helper to handle shortcut with consistent pattern
      const handleShortcut = (condition: boolean, action: () => void) => {
        if (condition) {
          e.preventDefault();
          action();
          return true;
        }
        return false;
      };

      // Option+R for recording (consistent with other shortcuts)
      if (
        handleShortcut(
          e.code === "KeyR" && hasOnlyModifiers(true) && !isInputField,
          onRecordToggle
        )
      )
        return;

      // Option/Alt shortcuts (use e.code instead of e.key for macOS compatibility)
      if (
        handleShortcut(e.code === "KeyP" && hasOnlyModifiers(true), () =>
          setShowCommandPalette(!showCommandPalette)
        )
      )
        return;

      if (
        handleShortcut(
          e.code === "KeyT" && hasOnlyModifiers(true) && !isInputField,
          () => setShowTextInput(true)
        )
      )
        return;

      if (
        handleShortcut(
          e.code === "KeyJ" && hasOnlyModifiers(true) && !isInputField,
          onPickRandomMemo
        )
      )
        return;

      if (
        handleShortcut(
          e.code === "KeyK" && hasOnlyModifiers(true) && !isInputField,
          () => setShowSearch(true)
        )
      )
        return;

      if (
        handleShortcut(
          e.code === "KeyF" && hasOnlyModifiers(true) && !isInputField,
          () => setIsSpotlightMode(!isSpotlightMode)
        )
      )
        return;

      // Single-key filter shortcuts ONLY work when spotlight is active
      if (isSpotlightMode && !isInputField && hasOnlyModifiers()) {
        const closeSpotlight = (action: () => void) => {
          e.preventDefault();
          action();
          setIsSpotlightMode(false);
        };

        // Star toggle
        const starMappings: Record<string, boolean> = {
          q: false, // all memos
          w: true, // starred only
        };
        if (e.key in starMappings) {
          closeSpotlight(() => setStarredOnly(starMappings[e.key]));
          return;
        }

        // Category filters
        const categoryFilters: Record<string, Category | "all"> = {
          a: "all",
          s: "media",
          d: "event",
          f: "journal",
          h: "tarot",
          j: "todo",
          k: "idea",
          l: "to buy",
          ";": "other",
        };
        if (e.key in categoryFilters) {
          closeSpotlight(() => setCategoryFilter(categoryFilters[e.key]));
          return;
        }

        // Size filters
        const sizeFiltersMap: Record<string, "all" | "S" | "M" | "L"> = {
          z: "all",
          x: "S",
          c: "M",
          v: "L",
        };
        if (e.key in sizeFiltersMap) {
          closeSpotlight(() => setSizeFilter(sizeFiltersMap[e.key]));
          return;
        }
      }

      // Escape handler - priority order: recording, modals, spotlight, then reset filters
      if (e.code === "Escape") {
        e.preventDefault();

        if (isRecording) return onCancelRecording();
        if (showSettings) return setShowSettings(false);
        if (isSpotlightMode) return setIsSpotlightMode(false);
        if (editingId) return cancelEdit();
        if (showRandomMemo) return setShowRandomMemo(false);
        if (showTextInput) {
          setShowTextInput(false);
          setTextInput("");
          return;
        }
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
          setSearchResults([]);
          return;
        }
        if (showCommandPalette) return setShowCommandPalette(false);

        // If nothing is open, reset all filters
        resetFilters();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    isRecording,
    editingId,
    showRandomMemo,
    showTextInput,
    showSearch,
    showCommandPalette,
    isSpotlightMode,
    showSettings,
    categoryFilter,
    sizeFilter,
    starredOnly,
    searchQuery,
    searchResults,
    textInput,
    setCategoryFilter,
    setSizeFilter,
    setStarredOnly,
    setIsSpotlightMode,
    setShowSearch,
    setShowTextInput,
    setShowRandomMemo,
    setShowCommandPalette,
    setShowSettings,
    setSearchQuery,
    setSearchResults,
    setTextInput,
    resetFilters,
    cancelEdit,
    onRecordToggle,
    onPickRandomMemo,
    onCancelRecording,
  ]);

  // Prevent scrolling when modals are open
  useEffect(() => {
    if (
      showSearch ||
      showTextInput ||
      showRandomMemo ||
      showCommandPalette ||
      showSettings
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    showSearch,
    showTextInput,
    showRandomMemo,
    showCommandPalette,
    showSettings,
  ]);
}
