import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * FormRow component provides a consistent grid layout for form fields
 * It creates a 12-column grid that can be used to arrange form fields
 * in various layouts (e.g., two fields side by side, full width field, etc.)
 */
export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-12 gap-4 mb-4", className)}>
      {children}
    </div>
  );
} 