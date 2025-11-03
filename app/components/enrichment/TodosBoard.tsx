"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Memo, TaskSize } from "../../types/memo";
import { LoadingSpinner } from "../LoadingSpinner";
import {
  CheckCircle2,
  GripVertical,
  Star,
  Trophy,
  Zap,
  X,
  Play,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../contexts/ToastContext";
import { useMemoOperations } from "../../hooks/useMemoOperations";
import { useUser } from "../../contexts/UserContext";

interface TodosBoardProps {
  todos: Memo[];
  isLoading: boolean;
  error?: Error | null;
  refetchTodos?: () => void;
}

type SizeFilter = "all" | "S" | "M" | "L";

// Estimate size from transcript/extracted data (simple heuristic)
function estimateSize(todo: Memo): TaskSize {
  const text = (todo.extracted?.what || todo.transcript).toLowerCase();
  const quickIndicators = ["quick", "fast", "just", "simple", "minute"];
  const mediumIndicators = ["30", "hour", "brief", "short"];
  const longIndicators = ["long", "extensive", "project", "complex", "hours"];

  if (quickIndicators.some((indicator) => text.includes(indicator))) {
    return "S";
  }
  if (longIndicators.some((indicator) => text.includes(indicator))) {
    return "L";
  }
  if (mediumIndicators.some((indicator) => text.includes(indicator))) {
    return "M";
  }
  // Default to M if unclear
  return "M";
}

export function TodosBoard({
  todos,
  isLoading,
  error,
  refetchTodos,
}: TodosBoardProps) {
  const { username } = useUser();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { toggleStar, softDelete } = useMemoOperations(
    username || "",
    refetchTodos || (() => {})
  );

  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [focusSessionTodoIds, setFocusSessionTodoIds] = useState<Set<string>>(
    new Set()
  );
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // 15 minutes
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState(0);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.deleted_at !== null).length;
    const active = todos.length - completed;
    const bySize = {
      S: todos.filter((t) => estimateSize(t) === "S").length,
      M: todos.filter((t) => estimateSize(t) === "M").length,
      L: todos.filter((t) => estimateSize(t) === "L").length,
    };
    const starred = todos.filter((t) => t.starred).length;

    return { completed, active, bySize, starred };
  }, [todos]);

  // Filter and sort todos
  const filteredTodos = useMemo(() => {
    let filtered = todos.filter((todo) => !todo.deleted_at);

    // Filter by size
    if (sizeFilter !== "all") {
      filtered = filtered.filter((todo) => estimateSize(todo) === sizeFilter);
    }

    // Sort: starred first, then by timestamp
    return filtered.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [todos, sizeFilter]);

  // Focus session management
  const toggleTodoInSession = (todoId: string) => {
    setFocusSessionTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  };

  const removeTodoFromSession = (todoId: string) => {
    setFocusSessionTodoIds((prev) => {
      const next = new Set(prev);
      next.delete(todoId);
      return next;
    });
  };

  const handleStartTimer = () => {
    if (focusSessionTodoIds.size === 0) return;
    setTimerActive(true);
    setTimerSeconds(15 * 60);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
  };

  const handleCompleteTodo = useCallback(
    async (todoId: string) => {
      try {
        await softDelete(todoId);
        setCompletedToday((prev) => prev + 1);
        // Invalidate queries to refresh the list
        await queryClient.invalidateQueries({ queryKey: ["memos"] });
        showSuccess("Todo completed! 🎉");
      } catch {
        showError("Failed to complete todo");
      }
    },
    [softDelete, showSuccess, showError, queryClient]
  );

  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    setDraggedTodoId(todoId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", todoId);
  };

  const handleDragOver = (e: React.DragEvent, todoId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(todoId);
  };

  const handleDragEnd = () => {
    setDraggedTodoId(null);
    setDragOverId(null);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetTodoId: string) => {
      e.preventDefault();
      const draggedTodoId = e.dataTransfer.getData("text/plain");

      if (!draggedTodoId || draggedTodoId === targetTodoId) {
        setDragOverId(null);
        return;
      }

      // Reorder in UI (we don't have order persistence yet, but we can add it later)
      const reordered = [...filteredTodos];
      const draggedIndex = reordered.findIndex((t) => t.id === draggedTodoId);
      const targetIndex = reordered.findIndex((t) => t.id === targetTodoId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDragOverId(null);
        return;
      }

      const [dragged] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, dragged);

      // Visual reordering (persistence can be added later with display_order field)

      setDragOverId(null);
    },
    [filteredTodos]
  );

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive]);

  // Handle timer completion
  useEffect(() => {
    if (!timerActive && timerSeconds === 0 && focusSessionTodoIds.size > 0) {
      showSuccess("Time's up! Great focus session! ⏰");
    }
  }, [timerActive, timerSeconds, focusSessionTodoIds.size, showSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sizeColors = {
    S: "from-emerald-500/20 to-green-500/20 border-emerald-500/40",
    M: "from-blue-500/20 to-cyan-500/20 border-blue-500/40",
    L: "from-purple-500/20 to-pink-500/20 border-purple-500/40",
  };

  const sizeLabels = {
    S: "Small",
    M: "Medium",
    L: "Large",
  };

  // Focus Session / Timer View
  if (timerActive) {
    const sessionTodos = filteredTodos.filter((todo) =>
      focusSessionTodoIds.has(todo.id)
    );
    const progress = ((15 * 60 - timerSeconds) / (15 * 60)) * 100;
    const completedInSession = sessionTodos.filter(
      (todo) => todo.deleted_at !== null
    ).length;
    const remainingInSession = sessionTodos.length - completedInSession;

    return (
      <section className="space-y-4">
        {/* Timer Header */}
        <div className="text-center space-y-4 py-6">
          <div className="relative w-48 h-48 mx-auto">
            {/* Progress ring */}
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="90"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-slate-800"
              />
              <circle
                cx="96"
                cy="96"
                r="90"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="text-indigo-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-mono font-bold text-white mb-1">
                {formatTime(timerSeconds)}
              </div>
              <div className="text-xs text-slate-400">Focus Session</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300">
                <span className="font-semibold text-white">
                  {completedInSession}
                </span>{" "}
                completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-slate-300">
                <span className="font-semibold text-white">
                  {remainingInSession}
                </span>{" "}
                remaining
              </span>
            </div>
          </div>

          <button
            onClick={handleStopTimer}
            className="px-4 py-2 rounded-lg border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
          >
            Stop Timer
          </button>
        </div>

        {/* Session Todos List */}
        <div className="space-y-2">
          {sessionTodos.map((todo) => {
            const size = estimateSize(todo);
            const sizeConfig = size ? sizeColors[size] : sizeColors.M;
            const isCompleted = todo.deleted_at !== null;

            return (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/10 opacity-60"
                    : "border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/30"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold bg-gradient-to-br ${sizeConfig} ${
                    size === "S"
                      ? "text-emerald-300"
                      : size === "M"
                        ? "text-blue-300"
                        : "text-purple-300"
                  }`}
                >
                  {size || "M"}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm ${
                      isCompleted
                        ? "text-emerald-300 line-through"
                        : "text-white"
                    }`}
                  >
                    {todo.extracted?.what || todo.transcript.substring(0, 60)}
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCompleteTodo(todo.id)}
                      className="p-1.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeTodoFromSession(todo.id)}
                      className="p-1.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from session"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Todos</h2>
            <p className="text-sm text-slate-400">
              Tasks and action items extracted from your memos.
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        {todos.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-slate-700/30 bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-slate-300">
                <span className="font-semibold text-white">{stats.active}</span>{" "}
                active
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300">
                <span className="font-semibold text-white">
                  {completedToday}
                </span>{" "}
                today
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300">
                <span className="font-semibold text-white">
                  {stats.starred}
                </span>{" "}
                priority
              </span>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Size Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "S", "M", "L"] as SizeFilter[]).map((size) => (
              <button
                key={size}
                onClick={() => setSizeFilter(size)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                  sizeFilter === size
                    ? size === "all"
                      ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-200"
                      : size === "S"
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-200"
                        : size === "M"
                          ? "border-blue-500/60 bg-blue-500/20 text-blue-200"
                          : "border-purple-500/60 bg-purple-500/20 text-purple-200"
                    : "border-slate-700/60 bg-slate-900/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                {size === "all"
                  ? "All"
                  : `${size} (${sizeLabels[size as "S" | "M" | "L"]})`}
              </button>
            ))}
          </div>

          {/* Start Timer Button - Always reserve space */}
          <div className="h-[32px] flex items-center">
            {focusSessionTodoIds.size > 0 ? (
              <button
                onClick={handleStartTimer}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-500/60 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition text-sm whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Start Timer{" "}
                  <span className="inline-block w-4 text-center font-mono">
                    {focusSessionTodoIds.size}
                  </span>
                </span>
              </button>
            ) : (
              <div className="w-[120px]" aria-hidden="true" />
            )}
          </div>
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
      ) : filteredTodos.length === 0 ? (
        <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-4 text-sm text-slate-400">
          No todos yet. Capture a memo with tasks or action items to see them
          here.
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredTodos.map((todo) => {
            const size = estimateSize(todo);
            const isDragging = draggedTodoId === todo.id;
            const isDragOver = dragOverId === todo.id;
            const isInSession = focusSessionTodoIds.has(todo.id);
            const sizeConfig = size ? sizeColors[size] : sizeColors.M;

            return (
              <div
                key={todo.id}
                id={`memo-${todo.id}`}
                data-memo-id={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragOver={(e) => handleDragOver(e, todo.id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, todo.id)}
                className={`group relative flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                  isDragging
                    ? "opacity-50"
                    : isDragOver
                      ? "border-indigo-400 ring-2 ring-indigo-400/50 bg-indigo-500/10"
                      : isInSession
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : `border-slate-700/30 bg-slate-800/20 hover:border-slate-600/50 hover:bg-slate-800/30`
                }`}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={() => toggleTodoInSession(todo.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    isInSession
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  title={
                    isInSession
                      ? "Remove from focus session"
                      : "Add to focus session"
                  }
                >
                  {isInSession && (
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  )}
                </button>

                {/* Drag Handle */}
                <GripVertical className="h-4 w-4 text-slate-600 cursor-move flex-shrink-0" />

                {/* Size Badge */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold bg-gradient-to-br ${sizeConfig} ${
                    size === "S"
                      ? "text-emerald-300"
                      : size === "M"
                        ? "text-blue-300"
                        : "text-purple-300"
                  }`}
                >
                  {size || "M"}
                </div>

                {/* Todo Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-white truncate">
                      {todo.extracted?.what || todo.transcript.substring(0, 80)}
                    </div>
                    {todo.starred && (
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleStar(todo.id, todo.starred || false)}
                    className={`p-1.5 rounded hover:bg-slate-700/50 transition-colors ${
                      todo.starred
                        ? "text-amber-400"
                        : "text-slate-400 hover:text-amber-400"
                    }`}
                    title={todo.starred ? "Remove priority" : "Mark priority"}
                  >
                    <Star
                      className={`h-4 w-4 ${todo.starred ? "fill-amber-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => handleCompleteTodo(todo.id)}
                    className="p-1.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Mark complete"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
