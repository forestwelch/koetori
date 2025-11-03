"use client";

import { useMemo } from "react";
import { ReminderItem } from "../types/enrichment";

export interface ReminderStats {
  overdue: number;
  upcoming: number;
  scheduled: number;
  total: number;
}

export function useReminderStats(reminders: ReminderItem[]): ReminderStats {
  return useMemo(() => {
    const now = new Date();
    let overdue = 0;
    let upcoming = 0;
    let scheduled = 0;

    reminders.forEach((reminder) => {
      if (reminder.dueAt) {
        scheduled++;
        const dueDate = new Date(reminder.dueAt);
        if (
          dueDate < now &&
          reminder.status !== "dismissed" &&
          reminder.status !== "acknowledged"
        ) {
          overdue++;
        } else if (dueDate >= now) {
          // Check if within next 7 days
          const daysUntil =
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (daysUntil <= 7) {
            upcoming++;
          }
        }
      }
    });

    return {
      overdue,
      upcoming,
      scheduled,
      total: reminders.length,
    };
  }, [reminders]);
}
