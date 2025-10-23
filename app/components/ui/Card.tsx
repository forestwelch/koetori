"use client";

/**
 * NOTE: This Card component is currently UNUSED but kept for future use.
 * TODO: Integrate Card component to replace manual card-like divs throughout the app:
 * - MemoItem.tsx
 * - MemoDisplay.tsx
 * - TranscriptionDisplay.tsx
 * - Other components with: bg-[#14151f]/60 backdrop-blur-xl rounded-xl border border-slate-700/30
 */

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/ui-utils";

const cardVariants = cva("rounded-xl border transition-all duration-200", {
  variants: {
    variant: {
      default:
        "bg-[#0d0e14]/40 backdrop-blur-xl border-slate-700/20 hover:bg-[#0d0e14]/60 hover:border-slate-600/40",
      elevated:
        "bg-[#0d0e14]/60 backdrop-blur-xl border-slate-700/30 hover:bg-[#0d0e14]/80 hover:border-slate-600/50 shadow-lg",
      ghost: "bg-transparent border-transparent hover:bg-slate-700/10",
      highlighted:
        "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    },
    interactive: {
      true: "cursor-pointer hover:scale-[1.02]",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    interactive: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export function Card({
  className,
  variant,
  padding,
  interactive,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding, interactive, className }))}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-white", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-400", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[#cbd5e1]", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center pt-4", className)} {...props} />;
}
