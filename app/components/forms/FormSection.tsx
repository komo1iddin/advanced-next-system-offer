import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * FormSection component provides a consistent way to group form fields
 * with an optional title and description
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("mb-8 w-full", className)}>
      {title && (
        <h3 className="text-lg font-medium mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      <div className="space-y-2 w-full">
        {children}
      </div>
    </div>
  );
} 