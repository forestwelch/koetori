"use client";

import { SearchModal } from "./SearchModal";
import { TextInputModal } from "./TextInputModal";
import { RandomMemoModal } from "./RandomMemoModal";
import { FeedbackModal } from "./FeedbackModal";
import { SettingsModal } from "./SettingsModal";
import { ArchivedMemosModal } from "./ArchivedMemosModal";
import { FilterCommandPalette } from "./FilterCommandPalette";
import { useModals } from "../contexts/ModalContext";
import { useFilters } from "../contexts/FilterContext";
import { Memo, Category } from "../types/memo";
import { FeedbackSubmission } from "../types/feedback";

interface ModalsContainerProps {
  // Search modal props
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  softDelete: (id: string) => void;
  toggleStar: (id: string, current: boolean) => void;
  restoreMemo: (id: string, memoData?: Memo) => Promise<void>;
  hardDelete: (id: string) => Promise<void>;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  onSizeChange: (memoId: string, newSize: "S" | "M" | "L" | null) => void;
  dismissReview: (memoId: string) => void;

  // Text input processing
  onTextSubmit: (text: string) => Promise<void>;

  // Feedback submission
  onFeedbackSubmit: (feedback: FeedbackSubmission) => Promise<void>;

  // Random memo
  onPickRandomMemo: () => void;
  username: string;
  isArchivedModalOpen: boolean;
  onOpenArchivedModal: () => void;
  onCloseArchivedModal: () => void;
}

export function ModalsContainer({
  editingId,
  editText,
  setEditText,
  startEdit,
  cancelEdit,
  saveEdit,
  softDelete,
  toggleStar,
  restoreMemo,
  hardDelete,
  onCategoryChange,
  onSizeChange,
  dismissReview,
  onTextSubmit,
  onFeedbackSubmit,
  onPickRandomMemo,
  username,
  isArchivedModalOpen,
  onOpenArchivedModal,
  onCloseArchivedModal,
}: ModalsContainerProps) {
  const {
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    setSearchResults,
    showTextInput,
    setShowTextInput,
    textInput,
    setTextInput,
    isProcessingText,
    showRandomMemo,
    setShowRandomMemo,
    randomMemo,
    showFeedback,
    setShowFeedback,
    showSettings,
    setShowSettings,
    showCommandPalette,
    setShowCommandPalette,
  } = useModals();

  const { setCategoryFilter, setStarredOnly } = useFilters();

  return (
    <>
      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearch={setSearchQuery}
        onClose={() => {
          setShowSearch(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        editingId={editingId}
        editText={editText}
        setEditText={setEditText}
        startEdit={startEdit}
        cancelEdit={cancelEdit}
        saveEdit={saveEdit}
        softDelete={softDelete}
        toggleStar={toggleStar}
        restoreMemo={restoreMemo}
        hardDelete={hardDelete}
        onCategoryChange={onCategoryChange}
        onSizeChange={onSizeChange}
        dismissReview={dismissReview}
      />

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={showTextInput}
        value={textInput}
        onChange={setTextInput}
        isProcessing={isProcessingText}
        onSubmit={() => onTextSubmit(textInput)}
        onClose={() => {
          setShowTextInput(false);
          setTextInput("");
        }}
      />

      {/* Random Memo Modal */}
      {showRandomMemo && randomMemo && (
        <RandomMemoModal
          isOpen={showRandomMemo}
          memo={randomMemo}
          onClose={() => setShowRandomMemo(false)}
          onShowAnother={onPickRandomMemo}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={onFeedbackSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        setShowFeedback={setShowFeedback}
        onOpenArchive={onOpenArchivedModal}
      />

      {/* Filter Command Palette */}
      <FilterCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        setCategoryFilter={setCategoryFilter}
        setStarredOnly={setStarredOnly}
      />

      {/* Archived Memos */}
      <ArchivedMemosModal
        isOpen={isArchivedModalOpen}
        onClose={onCloseArchivedModal}
        username={username}
        restoreMemo={restoreMemo}
        hardDelete={hardDelete}
      />
    </>
  );
}
