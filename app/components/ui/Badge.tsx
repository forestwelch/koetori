"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/ui-utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-700/30 text-slate-300 border-slate-600/30",
        primary: "bg-indigo-500/10 text-indigo-300 border-indigo-500/40",
        secondary: "bg-purple-500/10 text-purple-300 border-purple-500/40",
        success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
        warning: "bg-amber-500/10 text-amber-300 border-amber-500/40",
        danger: "bg-red-500/10 text-red-300 border-red-500/40",
        info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/40",
        // Category-specific variants
        journal: "bg-green-500/10 text-green-300 border-green-500/40",
        media: "bg-blue-500/10 text-blue-300 border-blue-500/40",
        event: "bg-orange-500/10 text-orange-300 border-orange-500/40",
        therapy: "bg-pink-500/10 text-pink-300 border-pink-500/40",
        tarot: "bg-purple-500/10 text-purple-300 border-purple-500/40",
        todo: "bg-yellow-500/10 text-yellow-300 border-yellow-500/40",
        idea: "bg-violet-500/10 text-violet-300 border-violet-500/40",
        other: "bg-gray-500/10 text-gray-300 border-gray-500/40",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  interactive,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size, interactive, className }))}
      {...props}
    />
  );
}
