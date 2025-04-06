import { ReactNode } from "react";
import { cn } from "@/app/lib/utils";

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
    <div className={cn("mb-8", className)}>
      {title && (
        <h3 className="text-lg font-medium mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
} 