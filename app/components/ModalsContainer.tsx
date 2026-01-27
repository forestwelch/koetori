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
import { useEditingHandlers } from "../contexts/EditingContext";
import { useMemoById } from "../hooks/useMemoById";
import { Memo, Category } from "../types/memo";
import { FeedbackSubmission } from "../types/feedback";

interface ModalsContainerProps {
  // Global modal handlers
  onTextSubmit: (text: string) => Promise<void>;
  onFeedbackSubmit: (feedback: FeedbackSubmission) => Promise<void>;
  onPickRandomMemo: () => void;
  onImageCapture: (file: File) => Promise<void>;
  username: string;
}

export function ModalsContainer({
  onTextSubmit,
  onFeedbackSubmit,
  onPickRandomMemo,
  onImageCapture,
  username,
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

  // Get editing handlers from context (provided by pages)
  const handlers = useEditingHandlers();

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
        editingId={handlers.editingId}
        editText={handlers.editText}
        setEditText={handlers.setEditText}
        startEdit={handlers.startEdit}
        cancelEdit={handlers.cancelEdit}
        saveEdit={handlers.saveEdit}
        editingSummaryId={handlers.editingSummaryId}
        summaryEditText={handlers.summaryEditText}
        setSummaryEditText={handlers.setSummaryEditText}
        startEditSummary={handlers.startEditSummary}
        cancelEditSummary={handlers.cancelEditSummary}
        saveSummary={handlers.saveSummary}
        softDelete={handlers.softDelete}
        toggleStar={handlers.toggleStar}
        restoreMemo={handlers.restoreMemo}
        hardDelete={handlers.hardDelete}
        onCategoryChange={handlers.onCategoryChange}
        dismissReview={handlers.dismissReview}
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
              editingId={handlers.editingId}
              editText={handlers.editText}
              setEditText={handlers.setEditText}
              startEdit={handlers.startEdit}
              cancelEdit={handlers.cancelEdit}
              saveEdit={handlers.saveEdit}
              editingSummaryId={handlers.editingSummaryId}
              summaryEditText={handlers.summaryEditText}
              setSummaryEditText={handlers.setSummaryEditText}
              startEditSummary={handlers.startEditSummary}
              cancelEditSummary={handlers.cancelEditSummary}
              saveSummary={handlers.saveSummary}
              softDelete={handlers.softDelete}
              toggleStar={handlers.toggleStar}
              restoreMemo={handlers.restoreMemo}
              hardDelete={handlers.hardDelete}
              onCategoryChange={handlers.onCategoryChange}
              dismissReview={handlers.dismissReview}
            />
          )}
        </>
      )}
    </>
  );
}
