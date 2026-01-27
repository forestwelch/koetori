import { useState } from "react";

/**
 * Hook to manage memo expansion state
 * Supports both controlled and uncontrolled modes
 */
export function useMemoExpansion(
  controlledExpanded?: boolean,
  onToggleExpand?: () => void
) {
  const [localExpanded, setLocalExpanded] = useState(false);

  // Use controlled expansion if provided, otherwise use local state
  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : localExpanded;

  const toggleExpanded =
    onToggleExpand || (() => setLocalExpanded(!localExpanded));

  return {
    isExpanded,
    toggleExpanded,
  };
}
