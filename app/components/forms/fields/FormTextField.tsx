"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormMessage } from "@/app/components/forms/FormField";

export interface FormTextFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

/**
 * Standardized text field component for forms
 */
export default function FormTextField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className = "",
  description,
  maxLength,
  minLength,
  pattern,
  autoComplete,
}: FormTextFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-12", className)}>
          <FormLabel>
            {label}{" "}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled || form.formState.isSubmitting}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            autoComplete={autoComplete}
            {...field}
            className={cn(
              "bg-white w-full min-w-[250px]", // Ensure white background and minimum width
              type === "password" ? "text-black" : "" // Ensure text is visible in password fields
            )}
            style={{ width: '100%' }}
          />
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          <FormMessage name={name} />
        </FormItem>
      )}
    />
  );
} 