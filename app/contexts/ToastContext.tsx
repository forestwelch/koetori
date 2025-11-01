"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClick?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    onClick?: () => void
  ) => void;
  removeToast: (id: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string, onClick?: () => void) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 5000,
      onClick?: () => void
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, message, type, duration, onClick };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showError = useCallback(
    (message: string) => showToast(message, "error", 7000),
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, onClick?: () => void) =>
      showToast(message, "success", 4000, onClick),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => showToast(message, "warning", 5000),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => showToast(message, "info", 4000),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
