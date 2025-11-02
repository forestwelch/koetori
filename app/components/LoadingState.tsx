import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="md" message="Loading memos..." />
    </div>
  );
}
