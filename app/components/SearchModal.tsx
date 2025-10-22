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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center sm:pt-16 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="w-full h-full sm:w-full sm:max-w-4xl sm:max-h-[80vh] bg-[#0d0e14] sm:bg-[#0d0e14]/98 backdrop-blur-xl sm:border sm:border-slate-700/40 sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Search Memos</h2>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/20 hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors"
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
                  strokeWidth={2}
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
              placeholder="Search memos..."
              className="w-full pl-12 pr-4 py-4 sm:py-3 bg-[#1e1f2a]/60 border border-slate-700/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors text-base sm:text-sm"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}
