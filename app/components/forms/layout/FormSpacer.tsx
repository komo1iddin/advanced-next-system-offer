"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormSpacerProps {
  /** Size of the spacer */
  size?: 'small' | 'medium' | 'large';
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormSpacer component for adding consistent vertical spacing
 * between form elements
 */
export default function FormSpacer({
  size = 'medium',
  className,
}: FormSpacerProps) {
  const sizeClass = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-8',
  }[size];
  
  return (
    <div className={cn(sizeClass, className)} aria-hidden="true" />
  );
} 