"use client";

import { useEffect } from "react";
import { Memo, Category } from "../types/memo";
import { MemoItem } from "./MemoItem";
import { useFilters } from "../contexts/FilterContext";

interface MemosListProps {
  memos: Memo[];
  newMemoId: string | null;
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  softDelete: (id: string) => void;
  toggleStar: (id: string, current: boolean) => void;
  restoreMemo: (id: string) => void;
  hardDelete: (id: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  onSizeChange: (memoId: string, newSize: "S" | "M" | "L" | null) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}

export function MemosList({
  memos,
  newMemoId,
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
  expandedId,
  setExpandedId,
}: MemosListProps) {
  const { filter } = useFilters();

  // Auto-expand when exactly 1 memo matches filters
  useEffect(() => {
    if (memos.length === 1) {
      setExpandedId(memos[0].id);
    } else if (memos.length !== 1) {
      setExpandedId(null);
    }
  }, [memos, setExpandedId]);

  return (
    <div className="space-y-4">
      {memos.map((memo) => {
        const isNew = memo.id === newMemoId;

        return (
          <MemoItem
            key={memo.id}
            memo={memo}
            isNew={isNew}
            filter={filter}
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
            isExpanded={expandedId === memo.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === memo.id ? null : memo.id)
            }
          />
        );
      })}
    </div>
  );
}
