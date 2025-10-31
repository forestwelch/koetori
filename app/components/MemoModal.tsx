"use client";

import { Modal } from "./ui/Modal";
import { Memo } from "../types/memo";
import { Category } from "../types/memo";
import { MemoItem } from "./MemoItem";

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: Memo | null;
  // Memo operations needed for MemoItem
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEdit: (memo: Memo) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  softDelete: (memoId: string) => void;
  toggleStar: (memoId: string, current: boolean) => void;
  restoreMemo: (memoId: string, memoData?: Memo) => void;
  hardDelete: (memoId: string) => void;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
  onSizeChange?: (memoId: string, newSize: "S" | "M" | "L" | null) => void;
  dismissReview: (memoId: string) => void;
}

export function MemoModal({
  isOpen,
  onClose,
  memo,
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
}: MemoModalProps) {
  if (!memo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Memo" size="lg">
      <div className="max-h-[80vh] overflow-y-auto">
        <MemoItem
          memo={memo}
          isNew={false}
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
          isExpanded={true}
          onToggleExpand={() => {}}
        />
      </div>
    </Modal>
  );
}
