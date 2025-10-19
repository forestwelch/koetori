"use client";

import { useState, useRef } from "react";
import { Memo } from "../types/memo";
import { Star, Archive } from "lucide-react";
import {
  getCategoryColor,
  getCategoryGradient,
  getCategoryIcon,
  formatConfidence,
} from "../lib/ui-utils";
import { MemoHeader } from "./MemoHeader";
import { MemoContent } from "./MemoContent";
import { MemoActions } from "./MemoActions";
import { SwipeIndicator } from "./SwipeIndicator";

interface MemoItemProps {
  memo: Memo;
  isNew: boolean;
  filter: "all" | "review" | "archive" | "starred";
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
}

export function MemoItem({
  memo,
  isNew,
  filter,
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
}: MemoItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (filter === "archive") return;
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || filter === "archive") return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setSwipeX(diff);
  };

  const handleTouchEnd = () => {
    if (filter === "archive") return;
    if (Math.abs(swipeX) > 100) {
      if (swipeX < 0) {
        toggleStar(memo.id, memo.starred || false);
      } else {
        softDelete(memo.id);
      }
    }
    setSwipeX(0);
    setIsSwiping(false);
  };

  const isEditing = editingId === memo.id;

  return (
    <div
      className="relative"
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: isSwiping ? "none" : "transform 0.3s ease",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SwipeIndicator swipeX={swipeX} />

      <div className="group relative p-4 sm:p-6 bg-[#0d0e14]/40 backdrop-blur-xl rounded-2xl border border-slate-700/20 hover:border-slate-600/40 hover:bg-[#0d0e14]/60 transition-all duration-1000 animate-in fade-in slide-in-from-top-4">
        {/* Starred indicator */}
        {memo.starred && filter !== "archive" && (
          <div className="absolute top-2 right-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/50" />
          </div>
        )}

        {/* New memo highlight */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 pointer-events-none transition-opacity duration-1000 ${
            isNew ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-0 rounded-2xl border border-indigo-500/50 shadow-lg shadow-indigo-500/20 pointer-events-none transition-opacity duration-1000 ${
            isNew ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="relative">
          <MemoHeader memo={memo} />

          <MemoContent
            memo={memo}
            isEditing={isEditing}
            editText={editText}
            setEditText={setEditText}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
          />

          <MemoActions
            memo={memo}
            filter={filter}
            isEditing={isEditing}
            startEdit={startEdit}
            toggleStar={toggleStar}
            softDelete={softDelete}
            restoreMemo={restoreMemo}
            hardDelete={hardDelete}
          />
        </div>
      </div>
    </div>
  );
}
