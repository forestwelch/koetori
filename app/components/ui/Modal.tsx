"use client";

import {
  Dialog,
  Modal as AriaModal,
  ModalOverlay,
  Heading,
} from "react-aria-components";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/ui-utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full h-full",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4",
        "bg-black/90 backdrop-blur-sm",
        className
      )}
    >
      <AriaModal
        className={cn(
          "relative w-full bg-[#0d0e14] shadow-2xl outline-none",
          "h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto",
          "rounded-none sm:rounded-2xl",
          "border-0 sm:border sm:border-slate-700/40",
          sizeClasses[size]
        )}
      >
        <Dialog className="outline-none">
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/20">
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
                  <p className="text-sm text-slate-400 mt-1">{description}</p>
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
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6 h-[calc(100%-theme(spacing.16))] sm:h-auto">
            {children}
          </div>
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
