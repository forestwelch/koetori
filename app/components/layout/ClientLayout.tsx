"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "./AppLayout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Skip AppLayout (sidebar/navbar) for record page
  if (pathname === "/record") {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
