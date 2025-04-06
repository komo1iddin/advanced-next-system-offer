"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
  /** Title of the form section */
  title?: string;
  
  /** Optional description text */
  description?: string;
  
  /** Form fields or other content */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to display a divider above the section */
  showDivider?: boolean;
}

/**
 * FormSection component for grouping related form fields
 * with a consistent heading and optional description
 */
export default function FormSection({
  title,
  description,
  children,
  className,
  showDivider = false,
}: FormSectionProps) {
  return (
    <div className={cn(
      "space-y-4",
      showDivider && "pt-6 border-t",
      className
    )}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium leading-6">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
} 