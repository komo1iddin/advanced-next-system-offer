"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        size === "sm" && "h-4 w-4 border-2",
        size === "default" && "h-6 w-6 border-2",
        size === "lg" && "h-8 w-8 border-3",
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading</span>
    </div>
  );
} 