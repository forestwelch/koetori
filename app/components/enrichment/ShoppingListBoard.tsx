"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle2, Archive, RotateCcw } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { ShoppingListItem } from "../../types/enrichment";
import { useShoppingActions } from "../../hooks/useShoppingActions";
import { useToast } from "../../contexts/ToastContext";

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
  const { showInfo } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

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
        {items.length > 0 && (
          <Button
            onClick={handleExport}
            variant="secondary"
            size="sm"
            className="text-xs"
          >
            Export List
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Collecting shopping items…
        </div>
      ) : error ? (
        <div className="text-sm text-rose-400">
          Failed to load shopping list: {error.message}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500">
          No shopping suggestions yet. Mention items to buy in your memos and
          they’ll appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Open Items */}
          {openItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-emerald-300">
                Open ({openItems.length})
              </h3>
              {openItems.map((item) => (
                <ShoppingItemCard
                  key={item.memoId}
                  item={item}
                  onStatusChange={handleStatusChange}
                  processingId={processingId}
                />
              ))}
            </div>
          )}

          {/* Purchased Items */}
          {purchasedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400">
                Purchased ({purchasedItems.length})
              </h3>
              {purchasedItems.map((item) => (
                <ShoppingItemCard
                  key={item.memoId}
                  item={item}
                  onStatusChange={handleStatusChange}
                  processingId={processingId}
                />
              ))}
            </div>
          )}

          {/* Archived Items */}
          {archivedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-500">
                Archived ({archivedItems.length})
              </h3>
              {archivedItems.map((item) => (
                <ShoppingItemCard
                  key={item.memoId}
                  item={item}
                  onStatusChange={handleStatusChange}
                  processingId={processingId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ShoppingItemCard({
  item,
  onStatusChange,
  processingId,
}: {
  item: ShoppingListItem;
  onStatusChange: (
    memoId: string,
    status: "purchased" | "archived" | "open"
  ) => Promise<void>;
  processingId: string | null;
}) {
  const isProcessing = processingId === item.memoId;

  return (
    <Card
      variant="default"
      padding="sm"
      className={`border-slate-700/30 ${
        item.status === "purchased"
          ? "bg-slate-900/30 opacity-75"
          : "bg-[#101722]/70"
      }`}
    >
      <CardContent className="flex items-start gap-3">
        <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
          <ShoppingBag className="h-4 w-4" />
        </span>

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
