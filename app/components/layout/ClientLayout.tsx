"use client";

import { AppLayout } from "./AppLayout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}
