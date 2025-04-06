"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormMessage } from "@/app/components/forms/FormField";

export interface FormTextareaFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  rows?: number;
  maxLength?: number;
}

/**
 * Standardized textarea field component for forms
 */
export default function FormTextareaField({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  description,
  rows = 4,
  maxLength,
}: FormTextareaFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex justify-between">
            <FormLabel>
              {label}{" "}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
            {maxLength && field.value && (
              <span className="text-xs text-muted-foreground">
                {String(field.value).length}/{maxLength}
              </span>
            )}
          </div>
          <Textarea
            placeholder={placeholder}
            disabled={disabled || form.formState.isSubmitting}
            className="resize-vertical"
            rows={rows}
            maxLength={maxLength}
            {...field}
          />
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 