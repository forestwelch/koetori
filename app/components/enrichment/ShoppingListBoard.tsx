"use client";

import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { ShoppingListItem } from "../../types/enrichment";

interface ShoppingListBoardProps {
  items: ShoppingListItem[];
  isLoading: boolean;
  error?: Error | null;
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
}: ShoppingListBoardProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Shopping List</h2>
          <p className="text-sm text-slate-400">
            AI grouped items pulled from your memos.
          </p>
        </div>
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
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.memoId}
              variant="default"
              padding="md"
              className="border-slate-700/30 bg-[#101722]/70"
            >
              <CardContent className="flex items-start gap-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <ShoppingBag className="h-4 w-4" />
                </span>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-white">
                      {item.itemName}
                    </h3>
                    {item.quantity && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                        Qty {item.quantity}
                      </span>
                    )}
                    {item.category && (
                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200">
                        {item.category}
                      </span>
                    )}
                    <span className="rounded-full border border-slate-700/40 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300">
                      {STATUS_BADGES[item.status] ?? item.status}
                    </span>
                    {item.urgencyScore !== null && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                        Urgency {urgencyLabel(item.urgencyScore)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400">
                    <span className="font-medium text-slate-300">
                      Last updated:
                    </span>{" "}
                    {item.updatedAt.toLocaleString()}
                  </div>

                  {item.transcriptExcerpt && (
                    <blockquote className="rounded-md border border-slate-700/30 bg-slate-900/30 px-3 py-2 text-xs italic text-slate-400">
                      “{item.transcriptExcerpt}”
                    </blockquote>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
