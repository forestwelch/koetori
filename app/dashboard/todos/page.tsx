"use client";

import { useUser } from "../../contexts/UserContext";
import { useMemosQuery } from "../../hooks/useMemosQuery";
import { useState } from "react";

export default function TodosDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  // TODO: Add size filter state when todos size system is implemented
  // const [sizeFilter, setSizeFilter] = useState<"S" | "M" | "L" | "all">("all");

  const {
    data: todos = [],
    isLoading: todosLoading,
    error: todosError,
  } = useMemosQuery({
    username: username || "",
    categoryFilter: "todo",
    starredOnly: false,
  });

  if (!enabled) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Todos</h2>
        <p className="text-slate-400 text-sm">
          Tasks and action items from your memos
        </p>
      </div>

      {/* TODO: Add size filter UI when todos size system is implemented */}
      {/* 
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-400">Filter by size:</span>
        <button onClick={() => setSizeFilter("all")}>All</button>
        <button onClick={() => setSizeFilter("S")}>S</button>
        <button onClick={() => setSizeFilter("M")}>M</button>
        <button onClick={() => setSizeFilter("L")}>L</button>
      </div>
      */}

      {todosLoading ? (
        <div className="text-slate-400 text-sm">Loading todos...</div>
      ) : todosError ? (
        <div className="text-rose-400 text-sm">
          Failed to load todos: {todosError.message}
        </div>
      ) : todos.length === 0 ? (
        <div className="text-slate-500 text-sm">No todos yet.</div>
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
    </div>
  );
}
