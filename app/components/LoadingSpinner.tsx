/**
 * Reusable loading spinner component
 * Used to show loading states consistently across the app
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="py-12 text-center" role="status" aria-live="polite">
      <div
        className={`${sizeClasses[size]} mx-auto animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent`}
        aria-hidden="true"
      />
      <p className="mt-4 text-[#94a3b8] text-sm">{message}</p>
    </div>
  );
}
