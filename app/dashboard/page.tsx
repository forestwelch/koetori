"use client";

import { useUser } from "../contexts/UserContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useRecentMemos } from "../hooks/useRecentMemos";
import { DashboardWidgets } from "../components/dashboard/DashboardWidgets";
import { LoadingState } from "../components/LoadingState";

export default function DashboardPage() {
  const { username } = useUser();
  const { stats, reminderStats, isLoading } = useDashboardStats(username);
  const { data: recentMemos = [] } = useRecentMemos(username, 1);

  if (!username) {
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-light text-white mb-2">
          Dashboard
        </h2>
        <p className="text-slate-400 text-sm">
          Overview of your memos and enrichments
        </p>
      </div>

      <DashboardWidgets
        stats={stats}
        reminderStats={reminderStats}
        recentMemosCount={recentMemos.length}
      />
    </div>
  );
}
