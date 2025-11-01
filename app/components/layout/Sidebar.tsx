"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  FileText,
  LayoutDashboard,
  X,
  Menu,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
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
  const [logoExpanded, setLogoExpanded] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(href);
  };

  const sidebarContent = (
    <nav className="h-full flex flex-col">
      <div
        className={cn("flex-1 py-4 space-y-1", isCollapsed ? "px-2" : "px-3")}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                isCollapsed
                  ? "justify-center w-full px-2 py-2"
                  : "gap-3 px-3 py-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-20 sm:top-24 left-4 z-[60] p-2 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
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
          "fixed lg:static inset-y-0 left-0 z-40 bg-[#0a0b0f]/95 backdrop-blur-xl border-r border-slate-800/50 transition-[width,transform] duration-300 ease-in-out",
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

        {/* Desktop Top Section - Logo and Collapse Button */}
        <div
          className={cn(
            "hidden lg:flex border-b border-slate-800/50 h-16 sm:h-20",
            isCollapsed
              ? "justify-center items-center px-2"
              : "justify-between items-center px-3 sm:px-4"
          )}
        >
          {/* Logo/Brand */}
          {isCollapsed ? (
            <button
              onClick={() => setLogoExpanded(!logoExpanded)}
              className="flex items-center justify-center w-full h-full transition-all"
            >
              <h1 className="text-2xl sm:text-3xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent transition-all duration-300">
                {logoExpanded ? "koetori" : "K"}
              </h1>
            </button>
          ) : (
            <button
              onClick={() => setLogoExpanded(!logoExpanded)}
              className="flex items-center gap-3 h-full transition-all"
            >
              <h1 className="text-2xl sm:text-3xl font-light bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent transition-all duration-300">
                {logoExpanded ? "K" : "koetori"}
              </h1>
            </button>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              setLogoExpanded(false);
            }}
            className="rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors p-1.5"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}
