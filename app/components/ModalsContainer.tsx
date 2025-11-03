"use client";

import { SearchModal } from "./SearchModal";
import { TextInputModal } from "./TextInputModal";
import { RandomMemoModal } from "./RandomMemoModal";
import { FeedbackModal } from "./FeedbackModal";
import { SettingsModal } from "./SettingsModal";
import { ArchivedMemosModal } from "./ArchivedMemosModal";
import { FilterCommandPalette } from "./FilterCommandPalette";
import { MemoModal } from "./MemoModal";
import { CameraModal } from "./CameraModal";
import { Modal } from "./ui/Modal";
import { useModals } from "../contexts/ModalContext";
import { useFilters } from "../contexts/FilterContext";
import { useMemoById } from "../hooks/useMemoById";
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
  // Summary editing props
  editingSummaryId: string | null;
  summaryEditText: string;
  setSummaryEditText: (text: string) => void;
  startEditSummary: (memo: Memo) => void;
  cancelEditSummary: () => void;
  saveSummary: (id: string) => void;
  softDelete: (id: string) => void;
  toggleStar: (id: string, current: boolean) => void;
  restoreMemo: (id: string, memoData?: Memo) => Promise<void>;
  hardDelete: (id: string) => Promise<void>;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  dismissReview: (memoId: string) => void;

  // Text input processing
  onTextSubmit: (text: string) => Promise<void>;

  // Feedback submission
  onFeedbackSubmit: (feedback: FeedbackSubmission) => Promise<void>;

  // Random memo
  onPickRandomMemo: () => void;

  // Image capture
  onImageCapture: (file: File) => Promise<void>;

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
  editingSummaryId,
  summaryEditText,
  setSummaryEditText,
  startEditSummary,
  cancelEditSummary,
  saveSummary,
  softDelete,
  toggleStar,
  restoreMemo,
  hardDelete,
  onCategoryChange,
  dismissReview,
  onTextSubmit,
  onFeedbackSubmit,
  onPickRandomMemo,
  onImageCapture,
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
    setIsSearching,
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
    showCamera,
    setShowCamera,
    showCommandPalette,
    setShowCommandPalette,
    showMemoModal,
    setShowMemoModal,
    memoModalId,
    setMemoModalId,
  } = useModals();

  const { data: memoModalData, isLoading: isLoadingMemo } = useMemoById(
    memoModalId,
    username
  );

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
        editingSummaryId={editingSummaryId}
        summaryEditText={summaryEditText}
        setSummaryEditText={setSummaryEditText}
        startEditSummary={startEditSummary}
        cancelEditSummary={cancelEditSummary}
        saveSummary={saveSummary}
        softDelete={softDelete}
        toggleStar={toggleStar}
        restoreMemo={restoreMemo}
        hardDelete={hardDelete}
        onCategoryChange={onCategoryChange}
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
      />

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={onImageCapture}
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

      {/* Memo Modal */}
      {showMemoModal && (
        <>
          {isLoadingMemo ? (
            <Modal
              isOpen={true}
              onClose={() => {
                setShowMemoModal(false);
                setMemoModalId(null);
              }}
              title="Loading..."
            >
              <div className="text-center py-8">Loading memo...</div>
            </Modal>
          ) : (
            <MemoModal
              isOpen={!!memoModalData}
              onClose={() => {
                setShowMemoModal(false);
                setMemoModalId(null);
              }}
              memo={memoModalData ?? null}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              saveEdit={saveEdit}
              editingSummaryId={editingSummaryId}
              summaryEditText={summaryEditText}
              setSummaryEditText={setSummaryEditText}
              startEditSummary={startEditSummary}
              cancelEditSummary={cancelEditSummary}
              saveSummary={saveSummary}
              softDelete={softDelete}
              toggleStar={toggleStar}
              restoreMemo={restoreMemo}
              hardDelete={hardDelete}
              onCategoryChange={onCategoryChange}
              dismissReview={dismissReview}
            />
          )}
        </>
      )}
    </>
  );
}
