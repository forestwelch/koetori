"use client";

import { Memo } from "../../types/memo";
import { LoadingSpinner } from "../LoadingSpinner";

interface TodosBoardProps {
  todos: Memo[];
  isLoading: boolean;
  error?: Error | null;
}

export function TodosBoard({ todos, isLoading, error }: TodosBoardProps) {
  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Todos</h2>
          <p className="text-sm text-slate-400">
            Tasks and action items extracted from your memos.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="md" message="Loading todos..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          Failed to load todos: {error.message}
        </div>
      ) : todos.length === 0 ? (
        <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-4 text-sm text-slate-400">
          No todos yet. Capture a memo with tasks or action items to see them
          here.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Placeholder: Compact todo list */}
          {/* TODO: Implement gamified, compact todo items with:
              - Minimal info (extracted.what/summary only)
              - Drag and drop support
              - Timer mode integration (15-min bursts)
              - Visual gamification (progress, achievements, etc.)
              - Very compact spacing to fit many todos on screen
          */}
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="p-2 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div className="text-sm text-white">
                {todo.extracted?.what || todo.transcript.substring(0, 100)}
              </div>
              {todo.starred && (
                <span className="text-xs text-amber-400">⭐ Priority</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
