"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "../components/LoadingState";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to media tab by default
    router.replace("/dashboard/media");
  }, [router]);

  return <LoadingState />;
}
