"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface FormDividerProps {
  /** Optional label text to display in the middle of the divider */
  label?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Vertical spacing around the divider */
  spacing?: "small" | "medium" | "large";
}

/**
 * FormDivider component for visually separating form sections
 * with an optional label in the middle
 */
export default function FormDivider({
  label,
  className,
  spacing = "medium",
}: FormDividerProps) {
  const spacingClass = {
    small: "my-2",
    medium: "my-4",
    large: "my-6",
  }[spacing];
  
  if (!label) {
    return (
      <Separator className={cn(spacingClass, className)} />
    );
  }
  
  return (
    <div className={cn("flex items-center", spacingClass, className)}>
      <Separator className="flex-grow" />
      <span className="px-3 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <Separator className="flex-grow" />
    </div>
  );
} 