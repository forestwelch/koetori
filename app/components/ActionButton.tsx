import { LucideIcon } from "lucide-react";
import { Button } from "./ui/Button";

interface ActionButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  variant?: "primary" | "secondary";
  iconOnly?: boolean; // For Settings button on desktop
  className?: string;
}

export function ActionButton({
  onClick,
  disabled = false,
  icon: Icon,
  label,
  shortcut,
  variant = "secondary",
  iconOnly = false,
  className = "",
}: ActionButtonProps) {
  const isPrimary = variant === "primary";

  const handleClick = (e?: React.MouseEvent) => {
    // Blur the button after click to prevent Space key from re-triggering it
    if (e) {
      (e.currentTarget as HTMLElement).blur();
    }
    onClick(e);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="unstyled"
      size="custom"
      aria-label={label}
      title={label}
      className={`group relative px-3 py-2 h-10 rounded-lg transition-all duration-200 ${
        isPrimary
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          : "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="flex items-center gap-2 whitespace-nowrap h-full">
        <Icon className="w-4 h-4 text-white flex-shrink-0" />
        {/* Desktop: show text unless iconOnly. Tablet: show text. Mobile: hide text */}
        {!iconOnly && (
          <span className="hidden md:inline text-sm font-medium text-white">
            {label}
          </span>
        )}
        {/* Desktop: show kbd. Tablet/Mobile: hide kbd */}
        {shortcut && !iconOnly && (
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900/50 rounded border border-slate-700/50 text-slate-400">
            {shortcut}
          </kbd>
        )}
      </div>
    </Button>
  );
}
