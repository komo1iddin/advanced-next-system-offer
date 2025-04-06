"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export interface FormCardProps {
  /** Title of the card */
  title?: string;
  
  /** Description text */
  description?: string;
  
  /** Card content (form fields) */
  children: React.ReactNode;
  
  /** Footer content (usually buttons) */
  footer?: React.ReactNode;
  
  /** Additional CSS classes for the Card component */
  className?: string;
  
  /** Additional CSS classes for the CardContent component */
  contentClassName?: string;
}

/**
 * FormCard component for wrapping form sections in a card UI
 * Provides consistent styling with title and description
 */
export default function FormCard({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: FormCardProps) {
  return (
    <Card className={cn("shadow-md", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="flex justify-end gap-3 border-t px-6 py-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
} 