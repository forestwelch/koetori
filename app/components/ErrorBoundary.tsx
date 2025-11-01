"use client";

import { Component, ReactNode, ErrorInfo, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const handleReset = () => {
    onReset();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0e14] to-[#0f1117] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-rose-200">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-rose-300/80">
                {error?.message ||
                  "An unexpected error occurred. Please try refreshing the page."}
              </p>
            </div>
            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-rose-300/60 hover:text-rose-300/80">
                  Error details (development only)
                </summary>
                <pre className="mt-2 rounded-md bg-slate-900/50 p-3 text-xs text-slate-300 overflow-auto max-h-48">
                  {error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-200 transition-colors hover:border-rose-400/50 hover:bg-rose-500/30"
              >
                Go Home
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-slate-700/40 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600/50 hover:bg-slate-900/70"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook version for functional components that need to show errors
export function useErrorHandler() {
  const { showError } = useToast();

  return useCallback(
    (error: unknown, context?: string) => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "An unexpected error occurred";

      const displayMessage = context ? `${context}: ${message}` : message;

      // Log to console for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("[ErrorHandler]", context || "Error", error);
      }

      showError(displayMessage);
    },
    [showError]
  );
}
