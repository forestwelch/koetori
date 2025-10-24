import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <LoadingSpinner />
      <p className="text-[#94a3b8] mt-4">Loading your memos...</p>
    </div>
  );
}
