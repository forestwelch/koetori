import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <LoadingSpinner size="md" />
    </div>
  );
}
