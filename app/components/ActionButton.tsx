import { LucideIcon } from "lucide-react";
import { Button } from "./ui/Button";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

export function ActionButton({
  onClick,
  disabled = false,
  icon: Icon,
  label,
  shortcut,
  variant = "secondary",
  size = "md",
  className = "",
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  const isSmall = size === "sm";

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="unstyled"
      size="custom"
      aria-label={label}
      title={label}
      className={`group relative ${
        isSmall ? "px-3 py-2" : "px-4 py-2.5"
      } rounded-lg transition-all duration-200 ${
        isPrimary
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          : "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`${isSmall ? "w-4 h-4" : "w-5 h-5"} text-white`} />
        <span
          className={`${isSmall ? "text-sm" : "text-base"} font-medium text-white`}
        >
          {label}
        </span>
        {shortcut && !isSmall && (
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-slate-900/50 rounded border border-slate-700/50 text-slate-400">
            {shortcut}
          </kbd>
        )}
      </div>
    </Button>
  );
}
