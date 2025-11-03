"use client";

import { useUser } from "../../contexts/UserContext";
import { useTodoItems } from "../../hooks/useEnrichmentData";
import { TodosBoard } from "../../components/enrichment/TodosBoard";
import { useScrollToMemo } from "../../hooks/useScrollToMemo";

export default function TodosDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data: todos = [],
    isLoading: todosLoading,
    error: todosError,
    refetch: refetchTodos,
  } = useTodoItems(username, { enabled });

  useScrollToMemo();

  if (!enabled) {
    return null;
  }

  return (
    <TodosBoard
      todos={todos}
      isLoading={todosLoading}
      error={todosError instanceof Error ? todosError : undefined}
      refetchTodos={refetchTodos}
    />
  );
}
