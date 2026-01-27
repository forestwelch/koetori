"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "../lib/ui-utils";
import { useUser } from "../contexts/UserContext";
import { useEditing } from "../contexts/EditingContext";
import { useMemoOperations } from "../hooks/useMemoOperations";
import {
  Film,
  Bell,
  ShoppingBag,
  CheckSquare,
  BookOpen,
  Sparkles,
  Lightbulb,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const dashboardTabs = [
  { href: "/dashboard/media", label: "Media", icon: Film },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/shopping", label: "Shopping", icon: ShoppingBag },
  { href: "/dashboard/todos", label: "Todos", icon: CheckSquare },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/tarot", label: "Tarot", icon: Sparkles },
  { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { username } = useUser();
  const { setHandlers } = useEditing();
  const queryClient = useQueryClient();

  // Determine current tab (default to media if on /dashboard)
  const currentTab = pathname === "/dashboard" ? "/dashboard/media" : pathname;

  // Refetch function that invalidates all enrichment queries
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ["inbox"] });
    queryClient.invalidateQueries({ queryKey: ["memos"] });
    queryClient.invalidateQueries({ queryKey: ["enrichment"] });
  };

  // Memo operations - enables editing from search/modals on dashboard pages
  const memoOperations = useMemoOperations(username || "", refetchAll);

  // Register editing handlers with global EditingContext
  // Handlers are stored in a ref, so we can update them on every render without causing re-renders
  useEffect(() => {
    // Update handlers ref on every render to ensure fresh function references
    setHandlers({
      editingId: memoOperations.editingId,
      editText: memoOperations.editText,
      setEditText: memoOperations.setEditText,
      startEdit: memoOperations.startEdit,
      cancelEdit: memoOperations.cancelEdit,
      saveEdit: memoOperations.saveEdit,
      editingSummaryId: memoOperations.editingSummaryId,
      summaryEditText: memoOperations.summaryEditText,
      setSummaryEditText: memoOperations.setSummaryEditText,
      startEditSummary: memoOperations.startEditSummary,
      cancelEditSummary: memoOperations.cancelEditSummary,
      saveSummary: memoOperations.saveSummary,
      softDelete: memoOperations.softDelete,
      toggleStar: memoOperations.toggleStar,
      restoreMemo: memoOperations.restoreMemo,
      hardDelete: memoOperations.hardDelete,
      onCategoryChange: memoOperations.handleCategoryChange,
      dismissReview: memoOperations.dismissReview,
    });
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => setHandlers(null);
  }, [setHandlers]);

  return (
    <div className="space-y-6">
      {/* Dashboard Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/50">
        {dashboardTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                isActive
                  ? "text-indigo-300 border-indigo-500"
                  : "text-slate-400 border-transparent hover:text-white hover:border-slate-600"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
