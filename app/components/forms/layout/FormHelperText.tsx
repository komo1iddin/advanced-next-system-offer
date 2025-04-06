"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";

export interface FormHelperTextProps {
  /** The text content to display */
  children: React.ReactNode;
  
  /** The type of helper text */
  variant?: "info" | "tip" | "warning";
  
  /** Whether to show an icon next to the text */
  showIcon?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormHelperText component for displaying consistent help text 
 * beneath form fields
 */
export default function FormHelperText({
  children,
  variant = "info",
  showIcon = true,
  className,
}: FormHelperTextProps) {
  const variantClasses = {
    info: "text-muted-foreground",
    tip: "text-blue-600 dark:text-blue-400",
    warning: "text-amber-600 dark:text-amber-400",
  };
  
  return (
    <div className={cn(
      "text-sm flex items-start mt-1.5 gap-1.5",
      variantClasses[variant],
      className
    )}>
      {showIcon && variant === "info" && (
        <InfoIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      )}
      {showIcon && variant === "tip" && (
        <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.09 9.00001C9.3251 8.33167 9.78915 7.76811 10.4 7.40914C11.0108 7.05016 11.7289 6.91895 12.4272 7.03872C13.1255 7.15849 13.7588 7.52153 14.2151 8.06353C14.6713 8.60554 14.9211 9.29153 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {showIcon && variant === "warning" && (
        <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17.5H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.96999 3.25H15.03C15.28 3.25 15.51 3.35 15.69 3.52L20.48 8.31C20.65 8.49 20.75 8.72 20.75 8.97V15.03C20.75 15.28 20.65 15.51 20.48 15.69L15.69 20.48C15.51 20.65 15.28 20.75 15.03 20.75H8.96999C8.71999 20.75 8.48999 20.65 8.30999 20.48L3.52 15.69C3.35 15.51 3.25 15.28 3.25 15.03V8.97C3.25 8.72 3.35 8.49 3.52 8.31L8.30999 3.52C8.48999 3.35 8.71999 3.25 8.96999 3.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      <span>{children}</span>
    </div>
  );
} 