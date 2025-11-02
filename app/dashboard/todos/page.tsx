"use client";

import { useUser } from "../../contexts/UserContext";
import { useMemosQuery } from "../../hooks/useMemosQuery";
import { TodosBoard } from "../../components/enrichment/TodosBoard";

export default function TodosDashboardPage() {
  const { username } = useUser();
  const enabled = Boolean(username);

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
    <TodosBoard
      todos={todos}
      isLoading={todosLoading}
      error={todosError instanceof Error ? todosError : undefined}
    />
  );
}
