"use client";

import { ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { ReactNode } from "react";
import { cn } from "../../lib/ui-utils";

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  isDismissable?: boolean;
  /**
   * Overlay opacity variant
   * - "standard": bg-black/60 (default)
   * - "dark": bg-black/80
   * - "light": bg-black/40
   */
  variant?: "standard" | "dark" | "light";
}

const variantClasses = {
  standard: "bg-black/60 backdrop-blur-sm",
  dark: "bg-black/80 backdrop-blur-md",
  light: "bg-black/40 backdrop-blur-sm",
};

/**
 * Reusable modal overlay component with consistent styling.
 * Provides backdrop, click-to-dismiss, and focus management.
 */
export function ModalOverlay({
  isOpen,
  onClose,
  children,
  className,
  isDismissable = true,
  variant = "standard",
}: ModalOverlayProps) {
  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable={isDismissable}
      className={cn(
        "fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </AriaModalOverlay>
  );
}
