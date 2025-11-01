"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Inbox, FileText, LayoutDashboard, X, Menu, Bird } from "lucide-react";
import { cn } from "../../lib/ui-utils";

interface SidebarProps {
  currentPath: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof Inbox;
}

const navItems: NavItem[] = [
  { href: "/", label: "Inbox", icon: Inbox },
  { href: "/memos", label: "Memos", icon: FileText },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Sidebar({ currentPath }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Delayed state for logo/text to sync with animation
  const [showExpandedContent, setShowExpandedContent] = useState(true);

  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(href);
  };

  // Sync content visibility with collapse animation (300ms delay)
  useEffect(() => {
    if (isCollapsed) {
      // Collapsing - hide expanded content after animation
      const timer = setTimeout(() => {
        setShowExpandedContent(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Expanding - show expanded content immediately (it will be clipped)
      setShowExpandedContent(true);
    }
  }, [isCollapsed]);

  const sidebarContent = (
    <nav className="h-full flex flex-col border-r border-slate-800/50">
      <div className="flex-1 py-4 space-y-1 px-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors group relative overflow-hidden",
                active
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                // Always use the same structure - never change justify or gap
                // Slightly shift right by using a bit more left padding
                "gap-3 pl-[11px] pr-2.5 py-2"
              )}
              title={
                isCollapsed || !showExpandedContent ? item.label : undefined
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className="whitespace-nowrap"
                style={{
                  clipPath: showExpandedContent
                    ? "inset(0)"
                    : "inset(0 100% 0 0)",
                  transition: "clip-path 300ms ease-in-out",
                  width: showExpandedContent ? "auto" : "0",
                  overflow: "hidden",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button - Top Left */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 bg-[#0a0b0f]/95 backdrop-blur-xl transition-[width,transform] duration-300 ease-in-out overflow-hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Top Section - Logo aligned with nav items, matching navbar height exactly */}
        <div className="hidden lg:flex overflow-hidden h-16 sm:h-20 items-center">
          <div className="w-full px-2.5">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center w-full pl-[11px] pr-2.5 py-2 rounded-lg hover:bg-slate-800/50 transition-colors overflow-hidden gap-3"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Bird
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-300",
                  showExpandedContent ? "text-slate-300" : "text-slate-400"
                )}
                style={{
                  filter: "drop-shadow(0 0 0px rgba(129, 140, 248, 0))",
                  transition: "filter 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter =
                    "drop-shadow(0 0 8px rgba(129, 140, 248, 0.6)) drop-shadow(0 0 4px rgba(192, 132, 252, 0.4)) drop-shadow(0 0 2px rgba(251, 113, 133, 0.3))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter =
                    "drop-shadow(0 0 0px rgba(129, 140, 248, 0))";
                }}
              />
              <span
                className="text-2xl sm:text-3xl font-light whitespace-nowrap bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent"
                style={{
                  clipPath: showExpandedContent
                    ? "inset(0)"
                    : "inset(0 100% 0 0)",
                  transition: "clip-path 300ms ease-in-out",
                }}
              >
                koetori
              </span>
            </button>
          </div>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}
