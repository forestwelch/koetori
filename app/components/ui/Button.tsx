"use client";

import { Button as AriaButton } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/ui-utils";
import { LoadingSpinner } from "../LoadingSpinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        secondary:
          "rounded-lg bg-slate-600 text-white hover:bg-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500",
        outline:
          "rounded-lg border border-slate-700/30 text-slate-300 hover:bg-slate-700/30 hover:border-slate-600/40 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500",
        ghost:
          "rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500",
        danger:
          "rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
        success:
          "rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500",
        unstyled: "",
      },
      size: {
        sm: "h-11 px-3 text-sm",
        md: "h-12 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-11 w-11",
        custom: "",
      },
      isActive: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      isActive: false,
    },
  }
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  title?: string;
}

export function Button({
  className,
  variant,
  size,
  isActive,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  title,
}: ButtonProps) {
  const handlePress = () => {
    // Blur the button after press to prevent Space key from re-triggering it
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClick?.();
  };

  return (
    <AriaButton
      className={cn(buttonVariants({ variant, size, isActive, className }))}
      isDisabled={disabled || isLoading}
      onPress={handlePress}
      type={type}
      aria-label={ariaLabel}
    >
      {isLoading && (
        <span className="mr-2 inline-flex items-center h-4 w-4" title={title}>
          <LoadingSpinner size="sm" />
        </span>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </AriaButton>
  );
}
