"use client";

import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Memo, Category } from "../types/memo";
import { MemoItem } from "./MemoItem";
import { useModals } from "../contexts/ModalContext";

interface SearchModalProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: Memo[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onClose: () => void;
  // MemoItem props
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (memoId: string) => void;
  // Summary editing props
  editingSummaryId: string | null;
  summaryEditText: string;
  setSummaryEditText: (text: string) => void;
  startEditSummary: (memo: Memo) => void;
  cancelEditSummary: () => void;
  saveSummary: (memoId: string) => void;
  softDelete: (memoId: string) => void;
  toggleStar: (memoId: string, currentStarred: boolean) => void;
  restoreMemo: (memoId: string, memoData?: Memo) => void;
  hardDelete: (memoId: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  onSizeChange: (memoId: string, newSize: "S" | "M" | "L" | null) => void;
  dismissReview: (memoId: string) => void;
}

export function SearchModal({
  isOpen,
  searchQuery,
  searchResults,
  isSearching,
  onSearch,
  onClose,
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
  onSizeChange,
  dismissReview,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchResults } = useModals();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Wrapper functions to update results instantly without reload
  const handleToggleStar = (id: string, starred: boolean) => {
    toggleStar(id, starred);
    // Update search results in memory immediately
    setSearchResults(
      searchResults.map((memo) =>
        memo.id === id ? { ...memo, starred: !starred } : memo
      )
    );
  };

  const handleSoftDelete = (id: string) => {
    softDelete(id);
    // Remove from search results immediately
    setSearchResults(searchResults.filter((memo) => memo.id !== id));
  };

  const handleDismissReview = (id: string) => {
    dismissReview(id);
    setSearchResults(
      searchResults.map((memo) =>
        memo.id === id ? { ...memo, needs_review: false } : memo
      )
    );
  };

  const handleSaveEdit = (id: string) => {
    saveEdit(id);
    // Update transcript in search results immediately
    setSearchResults(
      searchResults.map((memo) =>
        memo.id === id ? { ...memo, transcript: editText } : memo
      )
    );
  };

  const handleSaveSummary = (id: string) => {
    saveSummary(id);
    // Update extracted.what in search results immediately
    setSearchResults(
      searchResults.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              extracted: {
                ...memo.extracted,
                what: summaryEditText.trim(),
              },
            }
          : memo
      )
    );
  };

  const handleCategoryChange = (
    id: string,
    newCat: Category,
    oldCat: Category
  ) => {
    onCategoryChange(id, newCat, oldCat);
    // Update category in memory
    setSearchResults(
      searchResults.map((memo) =>
        memo.id === id ? { ...memo, category: newCat } : memo
      )
    );
  };

  const handleSizeChange = (id: string, size: "S" | "M" | "L" | null) => {
    onSizeChange(id, size);
    // Update size in memory
    setSearchResults(
      searchResults.map((memo) => (memo.id === id ? { ...memo, size } : memo))
    );
  };

  const handleClose = () => {
    onSearch(""); // Clear search query
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Search Memos"
      size="xl"
      className="sm:items-start sm:pt-16"
    >
      <div className="flex flex-col h-full sm:h-auto">
        <div className="mb-6 flex-shrink-0">
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search memos..."
            leftIcon={<Search className="w-5 h-5" />}
            className="text-base sm:text-sm py-4 sm:py-3"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Search Results */}
        <div className="flex-1 sm:flex-none sm:max-h-[60vh] overflow-y-auto min-h-0">
          <div className="space-y-4">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  Start typing to search your memos
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Search by content, people, tags, or categories
                </p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No memos found</p>
                <p className="text-slate-500 text-sm mt-2">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((memo) => (
                  <MemoItem
                    key={memo.id}
                    memo={memo}
                    isNew={false}
                    editingId={editingId}
                    editText={editText}
                    setEditText={setEditText}
                    startEdit={startEdit}
                    cancelEdit={cancelEdit}
                    saveEdit={handleSaveEdit}
                    editingSummaryId={editingSummaryId}
                    summaryEditText={summaryEditText}
                    setSummaryEditText={setSummaryEditText}
                    startEditSummary={startEditSummary}
                    cancelEditSummary={cancelEditSummary}
                    saveSummary={handleSaveSummary}
                    softDelete={handleSoftDelete}
                    toggleStar={handleToggleStar}
                    restoreMemo={restoreMemo}
                    hardDelete={hardDelete}
                    onCategoryChange={handleCategoryChange}
                    onSizeChange={handleSizeChange}
                    dismissReview={handleDismissReview}
                    searchQuery={searchQuery}
                    isSearchMode={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
