"use client";

import { ReactNode, ComponentType } from "react";
import { useUser } from "../../contexts/UserContext";
import { useScrollToMemo } from "../../hooks/useScrollToMemo";

/**
 * Generic wrapper for dashboard pages that follow the standard pattern:
 * 1. Get username from useUser()
 * 2. Fetch data with a hook
 * 3. Handle scroll to memo
 * 4. Render a Board component
 *
 * This consolidates the duplicated logic across 6 dashboard pages.
 */

interface DashboardPageWrapperProps<T> {
  /**
   * Hook that fetches the data for this dashboard
   * @param username - Current user's username
   * @param options - Query options (enabled flag)
   * @returns Query result with data, isLoading, error
   */
  useDataHook: (
    username: string | null,
    options: { enabled: boolean }
  ) => {
    data: T[] | undefined;
    isLoading: boolean;
    error: Error | null | unknown;
    refetch?: () => void;
  };

  /**
   * Board component to render (e.g., RemindersBoard, TodosBoard)
   */
  BoardComponent: ComponentType<any>;

  /**
   * Name of the prop to pass the data array to (e.g., "items", "reminders", "todos")
   * Defaults to "items"
   */
  dataPropName?: string;

  /**
   * Additional props to pass to the Board component
   */
  boardProps?: Record<string, any>;
}

export function DashboardPageWrapper<T>({
  useDataHook,
  BoardComponent,
  dataPropName = "items",
  boardProps = {},
}: DashboardPageWrapperProps<T>) {
  const { username } = useUser();
  const enabled = Boolean(username);

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useDataHook(username, {
    enabled,
  });

  // Handle scrolling to memo when memoId is in URL
  useScrollToMemo();

  // Don't render if no username (user not logged in)
  if (!enabled) {
    return null;
  }

  // Pass standard props plus any custom props to the Board component
  const allProps = {
    [dataPropName]: data, // Use dynamic prop name (e.g., "reminders", "todos", "items")
    isLoading,
    error: error instanceof Error ? error : undefined,
    username,
    refetch,
    ...boardProps,
  };

  return <BoardComponent {...allProps} />;
}
