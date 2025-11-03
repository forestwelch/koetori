"use client";

import { Check } from "lucide-react";
import { cn } from "../../lib/ui-utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  disabled = false,
}: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center w-5 h-5 rounded border transition-all",
        checked
          ? "bg-indigo-500 border-indigo-500 text-white"
          : "bg-slate-800/50 border-slate-600 text-transparent hover:border-slate-500",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
        className
      )}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check className="w-3.5 h-3.5" />}
    </button>
  );
}
