"use client";

import { Input as AriaInput } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/ui-utils";

const inputVariants = cva(
  "w-full px-4 py-3 bg-[#1e1f2a]/60 border border-slate-700/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-5 py-4 text-lg",
      },
      variant: {
        default: "bg-[#1e1f2a]/60 border-slate-700/30",
        ghost: "bg-transparent border-slate-700/20",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  className,
  size,
  variant,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <AriaInput
          id={inputId}
          className={cn(
            inputVariants({ size, variant, className }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error &&
              "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
