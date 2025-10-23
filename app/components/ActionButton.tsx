import { ReactNode } from "react";
import { Button } from "./ui/Button";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  ariaLabel: string;
  title: string;
  gradient: string;
  shadowColor: string;
  glowColor: string;
  isActive?: boolean;
  activeColor?: string;
}

export function ActionButton({
  onClick,
  disabled = false,
  icon,
  ariaLabel,
  title,
  gradient,
  shadowColor,
  glowColor,
  isActive = false,
  activeColor,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="unstyled"
      size="custom"
      aria-label={ariaLabel}
      className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300 ${
        isActive
          ? `${activeColor} animate-pulse`
          : disabled
            ? "bg-gray-500 shadow-gray-500/50 cursor-not-allowed"
            : `${gradient} ${shadowColor} hover:scale-105`
      }`}
    >
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${
          isActive
            ? `${activeColor?.replace("bg-", "bg-").replace("/50", "/100")} opacity-100`
            : `${glowColor} opacity-0 group-hover:opacity-100`
        }`}
      />
      <div className="relative flex items-center justify-center w-full h-full">
        {icon}
      </div>
    </Button>
  );
}
