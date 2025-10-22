"use client";

import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[#0d0e14]/98 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Search Memos</h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search memos, people, tags, categories..."
              className="w-full pl-12 pr-4 py-3 bg-[#1e1f2a]/60 border border-slate-700/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start typing to search your memos</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No memos found for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm mb-4">
                  Found {searchResults.length} memo
                  {searchResults.length !== 1 ? "s" : ""}
                </p>
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
      </div>
    </div>
  );
}
