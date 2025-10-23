"use client";

import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Memo, Category } from "../types/memo";
import { MemoItem } from "./MemoItem";

interface SearchModalProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: Memo[];
  onSearch: (query: string) => void;
  onClose: () => void;
  // MemoItem props
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (memoId: string) => void;
  softDelete: (memoId: string) => void;
  toggleStar: (memoId: string, currentStarred: boolean) => void;
  restoreMemo: (memoId: string) => void;
  hardDelete: (memoId: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
}

export function SearchModal({
  isOpen,
  searchQuery,
  searchResults,
  onSearch,
  onClose,
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
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    onSearch(""); // Clear search query
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
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
      <div className="mb-6">
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
      <div className="max-h-[60vh] overflow-y-auto">
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
                  filter="all"
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
                  searchQuery={searchQuery}
                  isSearchMode={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
