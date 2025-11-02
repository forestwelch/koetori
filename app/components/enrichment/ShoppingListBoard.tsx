"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  Archive,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { ShoppingListItem } from "../../types/enrichment";
import { useShoppingActions } from "../../hooks/useShoppingActions";
import { useToast } from "../../contexts/ToastContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";

interface ShoppingListBoardProps {
  items: ShoppingListItem[];
  isLoading: boolean;
  error?: Error | null;
  username: string | null;
}

const STATUS_BADGES: Record<string, string> = {
  open: "Open",
  purchased: "Purchased",
  archived: "Archived",
};

function urgencyLabel(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "";
  if (score >= 0.75) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
}

export function ShoppingListBoard({
  items,
  isLoading,
  error,
  username,
}: ShoppingListBoardProps) {
  const { markAsPurchased, markAsArchived, markAsOpen } =
    useShoppingActions(username);
  const { showInfo, showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleStatusChange = async (
    memoId: string,
    status: "purchased" | "archived" | "open"
  ) => {
    setProcessingId(memoId);
    try {
      if (status === "purchased") {
        await markAsPurchased(memoId);
      } else if (status === "archived") {
        await markAsArchived(memoId);
      } else {
        await markAsOpen(memoId);
      }
    } catch {
      // Error already shown by hook
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleSelect = (memoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memoId)) {
        next.delete(memoId);
      } else {
        next.add(memoId);
      }
      return next;
    });
  };

  const handleSelectAll = (itemIds: string[]) => {
    if (selectedIds.size === itemIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(itemIds));
    }
  };

  const handleBatchOperation = async (
    operation: "purchased" | "archived" | "open"
  ) => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    setProcessingId("batch");
    try {
      await Promise.all(ids.map((id) => handleStatusChange(id, operation)));
      const actionName =
        operation === "purchased"
          ? "marked as purchased"
          : operation === "archived"
            ? "archived"
            : "reopened";
      showSuccess(
        `${ids.length} item${ids.length > 1 ? "s" : ""} ${actionName}`
      );
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch {
      // Error already shown by hook
    } finally {
      setProcessingId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, memoId: string) => {
    setDraggedItemId(memoId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", memoId);
  };

  const handleDragOver = (e: React.DragEvent, memoId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(memoId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverId(null);
  };

  const handleDrop = useCallback(
    async (
      e: React.DragEvent,
      targetMemoId: string,
      items: ShoppingListItem[],
      status: string
    ) => {
      e.preventDefault();
      const draggedMemoId = e.dataTransfer.getData("text/plain");

      if (!draggedMemoId || draggedMemoId === targetMemoId) {
        setDragOverId(null);
        return;
      }

      // Find current item positions
      const statusItems = items.filter(
        (item) => item.status === status && item.memoId !== draggedMemoId
      );
      const draggedItem = items.find((item) => item.memoId === draggedMemoId);

      if (!draggedItem || draggedItem.status !== status) {
        setDragOverId(null);
        return;
      }

      // Find target position
      const targetIndex = statusItems.findIndex(
        (item) => item.memoId === targetMemoId
      );

      // Reorder items
      const reorderedItems = [...statusItems];
      reorderedItems.splice(targetIndex, 0, draggedItem);

      // Extract memoIds in new order
      const memoIds = reorderedItems.map((item) => item.memoId);

      // Optimistically update UI
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list", username],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((item) => {
            if (item.status !== status) return item;
            const newIndex = memoIds.indexOf(item.memoId);
            if (newIndex === -1) return item;
            return { ...item, displayOrder: newIndex };
          });
        }
      );

      try {
        // Update backend
        const response = await fetch("/api/shopping-list/reorder", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memoIds,
            status,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reorder items");
        }

        // Refetch to ensure consistency
        await queryClient.invalidateQueries({
          queryKey: ["shopping-list", username],
        });
      } catch (err) {
        showError(
          err instanceof Error
            ? `Failed to reorder items: ${err.message}`
            : "Failed to reorder items"
        );
        // Refetch to revert optimistic update
        await queryClient.invalidateQueries({
          queryKey: ["shopping-list", username],
        });
      }

      setDragOverId(null);
    },
    [username, queryClient, showError]
  );

  const handleExport = () => {
    const openItems = items.filter((item) => item.status === "open");
    const purchasedItems = items.filter((item) => item.status === "purchased");

    const exportData = {
      exported: new Date().toISOString(),
      open: openItems.map((item) => ({
        category: item.category,
        items: item.items,
        urgency: item.urgencyScore,
      })),
      purchased: purchasedItems.map((item) => ({
        category: item.category,
        items: item.items,
        purchasedAt: item.updatedAt.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showInfo("Shopping list exported");
  };

  const openItems = items.filter((item) => item.status === "open");
  const purchasedItems = items.filter((item) => item.status === "purchased");
  const archivedItems = items.filter((item) => item.status === "archived");

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Shopping List</h2>
          <p className="text-sm text-slate-400">
            AI grouped items pulled from your memos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <Button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) {
                    setSelectedIds(new Set());
                  }
                }}
                variant={isSelectMode ? "primary" : "secondary"}
                size="sm"
                className="text-xs"
              >
                {isSelectMode ? "Cancel" : "Select"}
              </Button>
              <Button
                onClick={handleExport}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Export List
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Batch Actions Bar */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
          <span className="text-sm text-indigo-200">
            {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => handleBatchOperation("purchased")}
              disabled={processingId === "batch"}
              variant="secondary"
              size="sm"
              className="text-xs h-7"
            >
              Mark Purchased
            </Button>
            <Button
              onClick={() => handleBatchOperation("archived")}
              disabled={processingId === "batch"}
              variant="secondary"
              size="sm"
              className="text-xs h-7"
            >
              Archive
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="md" message="Loading shopping list..." />
        </div>
      ) : error ? (
        <div className="text-sm text-rose-400">
          Failed to load shopping list: {error.message}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500">
          No shopping suggestions yet. Mention items to buy in your memos and
          they&apos;ll appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Open Items */}
          {openItems.length > 0 && (
            <ShoppingItemGroup
              title="Open"
              count={openItems.length}
              items={openItems}
              status="open"
              onStatusChange={handleStatusChange}
              processingId={processingId}
              isSelectMode={isSelectMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              draggedItemId={draggedItemId}
              dragOverId={dragOverId}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          )}

          {/* Purchased Items */}
          {purchasedItems.length > 0 && (
            <ShoppingItemGroup
              title="Purchased"
              count={purchasedItems.length}
              items={purchasedItems}
              status="purchased"
              onStatusChange={handleStatusChange}
              processingId={processingId}
              isSelectMode={isSelectMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              draggedItemId={draggedItemId}
              dragOverId={dragOverId}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          )}

          {/* Archived Items */}
          {archivedItems.length > 0 && (
            <ShoppingItemGroup
              title="Archived"
              count={archivedItems.length}
              items={archivedItems}
              status="archived"
              onStatusChange={handleStatusChange}
              processingId={processingId}
              isSelectMode={isSelectMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              draggedItemId={draggedItemId}
              dragOverId={dragOverId}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          )}
        </div>
      )}
    </section>
  );
}

interface ShoppingItemGroupProps {
  title: string;
  count: number;
  items: ShoppingListItem[];
  status: string;
  onStatusChange: (
    memoId: string,
    status: "purchased" | "archived" | "open"
  ) => Promise<void>;
  processingId: string | null;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (memoId: string) => void;
  onSelectAll: (memoIds: string[]) => void;
  draggedItemId: string | null;
  dragOverId: string | null;
  onDragStart: (e: React.DragEvent, memoId: string) => void;
  onDragOver: (e: React.DragEvent, memoId: string) => void;
  onDragEnd: () => void;
  onDrop: (
    e: React.DragEvent,
    targetMemoId: string,
    items: ShoppingListItem[],
    status: string
  ) => void;
}

function ShoppingItemGroup({
  title,
  count,
  items,
  status,
  onStatusChange,
  processingId,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  draggedItemId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ShoppingItemGroupProps) {
  const titleColor =
    status === "open"
      ? "text-emerald-300"
      : status === "purchased"
        ? "text-slate-400"
        : "text-slate-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-medium ${titleColor}`}>
          {title} ({count})
        </h3>
        {isSelectMode && items.length > 0 && (
          <button
            onClick={() => onSelectAll(items.map((item) => item.memoId))}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            {selectedIds.size === items.length ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>
      {items.map((item) => (
        <ShoppingItemCard
          key={item.memoId}
          item={item}
          onStatusChange={onStatusChange}
          processingId={processingId}
          isSelectMode={isSelectMode}
          isSelected={selectedIds.has(item.memoId)}
          onToggleSelect={onToggleSelect}
          draggedItemId={draggedItemId}
          dragOverId={dragOverId}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDrop={onDrop}
          allItems={items}
          status={status}
        />
      ))}
    </div>
  );
}

function ShoppingItemCard({
  item,
  onStatusChange,
  processingId,
  isSelectMode,
  isSelected,
  onToggleSelect,
  draggedItemId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  allItems,
  status,
}: {
  item: ShoppingListItem;
  onStatusChange: (
    memoId: string,
    status: "purchased" | "archived" | "open"
  ) => Promise<void>;
  processingId: string | null;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (memoId: string) => void;
  draggedItemId: string | null;
  dragOverId: string | null;
  onDragStart: (e: React.DragEvent, memoId: string) => void;
  onDragOver: (e: React.DragEvent, memoId: string) => void;
  onDragEnd: () => void;
  onDrop: (
    e: React.DragEvent,
    targetMemoId: string,
    items: ShoppingListItem[],
    status: string
  ) => void;
  allItems: ShoppingListItem[];
  status: string;
}) {
  const isProcessing = processingId === item.memoId;
  const isDragging = draggedItemId === item.memoId;
  const isDragOver = dragOverId === item.memoId;

  return (
    <Card
      variant="default"
      padding="sm"
      draggable={!isSelectMode && status === "open"}
      onDragStart={(e) => !isSelectMode && onDragStart(e, item.memoId)}
      onDragOver={(e) => !isSelectMode && onDragOver(e, item.memoId)}
      onDragEnd={onDragEnd}
      onDrop={(e) => !isSelectMode && onDrop(e, item.memoId, allItems, status)}
      className={`border-slate-700/30 transition-all ${
        item.status === "purchased"
          ? "bg-slate-900/30 opacity-75"
          : "bg-[#101722]/70"
      } ${
        isDragging ? "opacity-50" : ""
      } ${isDragOver ? "border-indigo-400 ring-2 ring-indigo-400/50" : ""} ${
        isSelectMode && isSelected ? "ring-2 ring-indigo-400" : ""
      }`}
    >
      <CardContent className="flex items-start gap-3">
        {/* Drag Handle / Checkbox / Icon */}
        <div className="mt-1 flex items-center gap-2">
          {isSelectMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.memoId)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
          ) : status === "open" ? (
            <GripVertical className="h-5 w-5 text-slate-500 cursor-move" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <ShoppingBag className="h-4 w-4" />
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="text-sm font-medium text-white">
              {item.category ?? "Shopping"}
            </span>
            <span className="rounded-full border border-slate-700/40 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300">
              {STATUS_BADGES[item.status] ?? item.status}
            </span>
            {item.urgencyScore !== null && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                Urgency {urgencyLabel(item.urgencyScore)}
              </span>
            )}
          </div>

          <ul className="grid gap-1 text-sm text-slate-200 md:grid-cols-2">
            {item.items.map((entry, index) => (
              <li
                key={`${item.memoId}-${index}`}
                className="flex items-center gap-2 rounded-md border border-slate-700/30 bg-[#0d1421]/70 px-2 py-1"
              >
                {item.status === "purchased" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
                <span
                  className={`flex-1 text-sm ${
                    item.status === "purchased"
                      ? "line-through text-slate-500"
                      : ""
                  }`}
                >
                  {entry}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              Last updated: {item.updatedAt.toLocaleString()}
            </span>

            {!isSelectMode && (
              <div className="flex flex-wrap items-center gap-2">
                {item.status !== "purchased" && (
                  <Button
                    onClick={() => onStatusChange(item.memoId, "purchased")}
                    disabled={isProcessing}
                    variant="secondary"
                    size="custom"
                    className="h-7 px-2.5 text-xs"
                    leftIcon={<CheckCircle2 className="h-3 w-3" />}
                  >
                    Mark Purchased
                  </Button>
                )}
                {item.status === "purchased" && (
                  <Button
                    onClick={() => onStatusChange(item.memoId, "open")}
                    disabled={isProcessing}
                    variant="secondary"
                    size="custom"
                    className="h-7 px-2.5 text-xs"
                    leftIcon={<RotateCcw className="h-3 w-3" />}
                  >
                    Reopen
                  </Button>
                )}
                {item.status !== "archived" && (
                  <Button
                    onClick={() => onStatusChange(item.memoId, "archived")}
                    disabled={isProcessing}
                    variant="ghost"
                    size="custom"
                    className="h-7 px-2.5 text-xs"
                    leftIcon={<Archive className="h-3 w-3" />}
                  >
                    Archive
                  </Button>
                )}
                <Link
                  href={{ pathname: "/", hash: `memo-${item.memoId}` }}
                  prefetch={false}
                  className="rounded-full border border-slate-700/40 px-2 py-0.5 text-[11px] text-slate-300 transition hover:border-emerald-400/50 hover:text-white"
                >
                  View memo
                </Link>
              </div>
            )}
          </div>

          {item.transcriptExcerpt && (
            <blockquote className="rounded-md border border-slate-700/30 bg-slate-900/30 px-3 py-2 text-[11px] italic text-slate-400">
              &ldquo;{item.transcriptExcerpt}&rdquo;
            </blockquote>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
