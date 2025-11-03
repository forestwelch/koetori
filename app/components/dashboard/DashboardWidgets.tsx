"use client";

import { useMemo } from "react";
import { Card } from "../ui/Card";
import { TrendingUp, Bell, ArrowUp, Calendar, Clock } from "lucide-react";
import { cn } from "../../lib/ui-utils";
import Link from "next/link";

import { DashboardStats } from "../../hooks/useDashboardStats";
import { ReminderStats } from "../../hooks/useReminderStats";

interface DashboardWidgetsProps {
  stats: DashboardStats;
  reminderStats: ReminderStats;
  recentMemosCount: number;
}

export function DashboardWidgets({
  stats,
  reminderStats,
  recentMemosCount,
}: DashboardWidgetsProps) {
  // Calculate trends (simplified - would need historical data for real trends)
  const memoTrend = recentMemosCount > 0 ? "up" : "neutral";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Today's Insights */}
      <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">
              Today's Insights
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">New Memos</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {recentMemosCount}
              </span>
              {memoTrend === "up" && (
                <ArrowUp className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>

          {reminderStats.overdue > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <span className="text-sm text-slate-400">Overdue</span>
              <span className="text-sm font-semibold text-red-400">
                {reminderStats.overdue}
              </span>
            </div>
          )}

          {reminderStats.upcoming > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Upcoming</span>
              <span className="text-sm font-semibold text-amber-400">
                {reminderStats.upcoming}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Upcoming Reminders Timeline */}
      {reminderStats.upcoming > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Upcoming</h3>
            </div>
            <Link
              href="/dashboard/reminders"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                {reminderStats.upcoming} reminders scheduled
              </span>
            </div>
            {reminderStats.overdue > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400">
                  {reminderStats.overdue} overdue
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
