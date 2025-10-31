"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Trash2, Archive, Loader2 } from "lucide-react";

import { supabase } from "../lib/supabase";
import { Memo } from "../types/memo";
import { CategoryBadge } from "./CategoryBadge";
import { Button } from "./ui/Button";

interface ArchivedMemosModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  restoreMemo: (id: string, memoData?: Memo) => Promise<void>;
  hardDelete: (id: string) => Promise<void>;
}

export function ArchivedMemosModal({
  isOpen,
  onClose,
  username,
  restoreMemo,
  hardDelete,
}: ArchivedMemosModalProps) {
  const [archivedMemos, setArchivedMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<
    "restore" | "delete" | null
  >(null);

  const fetchArchivedMemos = async () => {
    if (!username) return;

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("memos")
      .select("*")
      .eq("username", username)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(200);

    if (fetchError) {
      console.error("Error fetching archived memos:", fetchError);
      setError("Failed to load archived memos");
    } else {
      const transformed = (data || []).map((memo) => ({
        ...memo,
        timestamp: new Date(memo.timestamp),
        deleted_at: memo.deleted_at ? new Date(memo.deleted_at) : null,
      })) as Memo[];
      setArchivedMemos(transformed);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchivedMemos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, username]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden bg-[#0a0b0f]/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-200">
            <Archive className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-medium">Archived Memos</h2>
          </div>
          <Button
            onClick={onClose}
            variant="unstyled"
            size="custom"
            className="text-slate-400 hover:text-white"
          >
            Close
          </Button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Loading archived memos...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-400 text-sm">
              {error}
            </div>
          ) : archivedMemos.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              No archived memos yet.
            </div>
          ) : (
            <div className="space-y-4">
              {archivedMemos.map((memo) => {
                const summary =
                  memo.extracted?.what || memo.transcript.slice(0, 120);

                return (
                  <div
                    key={memo.id}
                    className="group relative p-4 bg-[#0d0e14]/60 backdrop-blur-xl rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <CategoryBadge category={memo.category} />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#e2e8f0] mb-2 line-clamp-2">
                          {summary}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#94a3b8]">
                          <span>
                            Archived on{" "}
                            {memo.deleted_at
                              ? new Date(memo.deleted_at).toLocaleString()
                              : "Unknown"}
                          </span>
                          <span className="text-slate-700">•</span>
                          <span>
                            Created {new Date(memo.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      <Button
                        onClick={async () => {
                          setProcessingId(memo.id);
                          setProcessingAction("restore");
                          try {
                            await restoreMemo(memo.id, memo);
                            setArchivedMemos((prev) =>
                              prev.filter((item) => item.id !== memo.id)
                            );
                          } catch (err) {
                            console.error(err);
                            setError("Failed to restore memo");
                          } finally {
                            setProcessingId(null);
                            setProcessingAction(null);
                          }
                        }}
                        disabled={processingId === memo.id}
                        variant="unstyled"
                        size="custom"
                        leftIcon={
                          processingId === memo.id &&
                          processingAction === "restore" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Restore
                      </Button>
                      <Button
                        onClick={async () => {
                          setProcessingId(memo.id);
                          setProcessingAction("delete");
                          try {
                            await hardDelete(memo.id);
                            setArchivedMemos((prev) =>
                              prev.filter((item) => item.id !== memo.id)
                            );
                          } catch (err) {
                            console.error(err);
                            setError("Failed to delete memo");
                          } finally {
                            setProcessingId(null);
                            setProcessingAction(null);
                          }
                        }}
                        disabled={processingId === memo.id}
                        variant="unstyled"
                        size="custom"
                        leftIcon={
                          processingId === memo.id &&
                          processingAction === "delete" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
