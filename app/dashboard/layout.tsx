"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/ui-utils";
import { Film, Bell, ShoppingBag } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const dashboardTabs = [
  { href: "/dashboard/media", label: "Media", icon: Film },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/shopping", label: "Shopping", icon: ShoppingBag },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Determine current tab (default to media if on /dashboard)
  const currentTab = pathname === "/dashboard" ? "/dashboard/media" : pathname;

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
