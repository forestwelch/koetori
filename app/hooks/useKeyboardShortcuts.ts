"use client";

import { useEffect } from "react";
import { useFilters } from "../contexts/FilterContext";
import { useModals } from "../contexts/ModalContext";

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
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    sizeFilter,
    setSizeFilter,
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
        editingId !== null; // Disable shortcuts when editing a memo

      // Cmd/Ctrl+P for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
      }

      // Cmd/Ctrl + E for text input (CMD+T opens new tab)
      if ((e.metaKey || e.ctrlKey) && e.key === "e" && !isInputField) {
        e.preventDefault();
        setShowTextInput(true);
      }

      // Cmd/Ctrl + J for random memo (J = "Jump to random")
      if ((e.metaKey || e.ctrlKey) && e.key === "j" && !isInputField) {
        e.preventDefault();
        onPickRandomMemo();
      }

      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !isInputField) {
        e.preventDefault();
        setShowSearch(true);
      }

      // Cmd/Ctrl + ; for spotlight mode (semicolon is near filters keys)
      if ((e.metaKey || e.ctrlKey) && e.key === ";" && !isInputField) {
        e.preventDefault();
        setIsSpotlightMode(!isSpotlightMode);
      }

      // Filter shortcuts work globally when not typing (and close spotlight if open)
      if (!isInputField && !e.metaKey && !e.ctrlKey) {
        // View filters: Q, W, E, R
        if (e.key === "q") {
          e.preventDefault();
          setFilter("all");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "w") {
          e.preventDefault();
          setFilter("starred");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "e") {
          e.preventDefault();
          setFilter("review");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "r") {
          e.preventDefault();
          setFilter("archive");
          setIsSpotlightMode(false);
          return;
        }
        // Category filters: A, S, D, F, G, H, J, K, L, ;
        else if (e.key === "a") {
          e.preventDefault();
          setCategoryFilter("all");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "s") {
          e.preventDefault();
          setCategoryFilter("media");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "d") {
          e.preventDefault();
          setCategoryFilter("event");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "f") {
          e.preventDefault();
          setCategoryFilter("journal");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "g") {
          e.preventDefault();
          setCategoryFilter("therapy");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "h") {
          e.preventDefault();
          setCategoryFilter("tarot");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "j") {
          e.preventDefault();
          setCategoryFilter("todo");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "k") {
          e.preventDefault();
          setCategoryFilter("idea");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "l") {
          e.preventDefault();
          setCategoryFilter("to buy");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === ";") {
          e.preventDefault();
          setCategoryFilter("other");
          setIsSpotlightMode(false);
          return;
        }
        // Size filters: Z, X, C, V
        else if (e.key === "z") {
          e.preventDefault();
          setSizeFilter("all");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "x") {
          e.preventDefault();
          setSizeFilter("S");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "c") {
          e.preventDefault();
          setSizeFilter("M");
          setIsSpotlightMode(false);
          return;
        } else if (e.key === "v") {
          e.preventDefault();
          setSizeFilter("L");
          setIsSpotlightMode(false);
          return;
        }
      }

      // Cmd+1/2/3 for quick "All" filters
      if (!isInputField && (e.metaKey || e.ctrlKey)) {
        if (e.key === "1") {
          e.preventDefault();
          setFilter("all");
          setIsSpotlightMode(false);
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          setCategoryFilter("all");
          setIsSpotlightMode(false);
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          setSizeFilter("all");
          setIsSpotlightMode(false);
          return;
        }
      }

      // Escape priority order: recording, modals, spotlight, then reset filters
      if (e.code === "Escape") {
        e.preventDefault();

        // Cancel recording first
        if (isRecording) {
          onCancelRecording();
          return;
        }

        // Close modals
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (isSpotlightMode) {
          setIsSpotlightMode(false);
          return;
        }
        if (editingId) {
          cancelEdit();
          return;
        }
        if (showRandomMemo) {
          setShowRandomMemo(false);
          return;
        }
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
        if (showCommandPalette) {
          setShowCommandPalette(false);
          return;
        }

        // If nothing is open, reset all filters to "all"
        resetFilters();
      }

      // Space to start/stop recording (only when not in input field)
      if (e.code === "Space" && !isInputField) {
        e.preventDefault();
        onRecordToggle();
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
    filter,
    categoryFilter,
    sizeFilter,
    searchQuery,
    searchResults,
    textInput,
    setFilter,
    setCategoryFilter,
    setSizeFilter,
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
      showSettings ||
      isSpotlightMode
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
    isSpotlightMode,
  ]);
}
