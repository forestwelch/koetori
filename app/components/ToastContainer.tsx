"use client";

import { useEffect, useRef } from "react";
import { useToast, Toast } from "../contexts/ToastContext";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-200",
    icon: "text-emerald-400",
  },
  error: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-200",
    icon: "text-rose-400",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-200",
    icon: "text-amber-400",
  },
  info: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-200",
    icon: "text-indigo-400",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const styles = TOAST_STYLES[toast.type];
  const Icon = TOAST_ICONS[toast.type];

  return (
    <div
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={`group relative flex items-start gap-3 rounded-xl border ${styles.border} ${styles.bg} px-4 py-3 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-right-full fade-in`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden="true" />
      <p className={`flex-1 text-sm ${styles.text}`}>{toast.message}</p>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className={`shrink-0 rounded-md p-1 transition-colors ${styles.icon} hover:${styles.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
