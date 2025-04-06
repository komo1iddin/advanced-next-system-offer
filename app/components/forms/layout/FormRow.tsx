"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormRowProps {
  /** Form fields or other content */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Number of columns on mobile (default: 1) */
  mobileColumns?: 1 | 2;
  
  /** Number of columns on desktop */
  columns?: 1 | 2 | 3 | 4;
  
  /** Gap between columns */
  gap?: 'small' | 'medium' | 'large';
}

/**
 * FormRow component for creating responsive horizontal layouts
 * of form fields. Allows 1-4 columns with different mobile behavior.
 */
export default function FormRow({
  children,
  className,
  mobileColumns = 1,
  columns = 2,
  gap = 'medium',
}: FormRowProps) {
  const gapClass = {
    small: 'gap-2', 
    medium: 'gap-4',
    large: 'gap-6'
  }[gap];
  
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };
  
  const mobileColsClass = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
  };
  
  return (
    <div className={cn(
      'grid w-full',
      gapClass,
      'grid-cols-1', 
      mobileColsClass[mobileColumns],
      `md:${gridColsClass[columns]}`,
      className
    )}>
      {children}
    </div>
  );
} 