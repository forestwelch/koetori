"use client";

import { ReactNode } from "react";

// Minimal layout for recording page - no AppLayout, no sidebar, no navbar
export default function RecordLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0e14] to-[#0f1117] text-white">
      {children}
    </div>
  );
}
