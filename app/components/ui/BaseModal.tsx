"use client";

import { Modal as AriaModal, Dialog, Heading } from "react-aria-components";
import { X } from "lucide-react";
import { Button } from "./Button";
import { ModalOverlay } from "./ModalOverlay";
import { cn } from "../../lib/ui-utils";
import { ReactNode } from "react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  /**
   * Overlay opacity variant
   */
  overlayVariant?: "standard" | "dark" | "light";
  /**
   * Custom header content (overrides title/description if provided)
   */
  header?: ReactNode;
  /**
   * Custom footer content
   */
  footer?: ReactNode;
  /**
   * Whether the modal should take full height on mobile
   */
  fullHeightOnMobile?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full h-full",
};

/**
 * Base modal component that extends React Aria Modal with consistent styling.
 * This is the foundation for all modals in the app.
 */
export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  overlayClassName,
  size = "md",
  showCloseButton = true,
  overlayVariant = "standard",
  header,
  footer,
  fullHeightOnMobile = true,
}: BaseModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      variant={overlayVariant}
      className={cn(
        fullHeightOnMobile ? "items-end sm:items-center" : "items-center",
        overlayClassName
      )}
    >
      <AriaModal
        className={cn(
          "relative w-full bg-[#0d0e14] shadow-2xl outline-none",
          fullHeightOnMobile
            ? "h-full sm:h-auto sm:max-h-[90vh]"
            : "h-auto max-h-[90vh]",
          "flex flex-col",
          fullHeightOnMobile ? "rounded-none sm:rounded-2xl" : "rounded-2xl",
          fullHeightOnMobile
            ? "border-0 sm:border sm:border-slate-700/40"
            : "border border-slate-700/40",
          sizeClasses[size],
          className
        )}
      >
        <Dialog className="outline-none flex flex-col h-full sm:h-auto overflow-hidden">
          {/* Header */}
          {(header || title || showCloseButton) && (
            <div className="flex items-center justify-between px-4 py-1.5 sm:px-4 sm:py-2 flex-shrink-0">
              {header ? (
                header
              ) : (
                <>
                  <div>
                    {title && (
                      <Heading
                        slot="title"
                        className="text-lg sm:text-xl font-semibold text-white"
                      >
                        {title}
                      </Heading>
                    )}
                    {description && (
                      <p className="text-sm text-slate-400 mt-0">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="text-slate-400 hover:text-white -mr-2 sm:mr-0"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-4 pt-0 pb-2 sm:px-4 sm:pt-0 sm:pb-3 flex-1 overflow-y-auto min-h-0">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 border-t border-slate-700/50 px-4 py-3">
              {footer}
            </div>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
