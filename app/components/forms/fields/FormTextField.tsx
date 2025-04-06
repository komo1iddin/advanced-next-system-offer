"use client";

import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <FormItem className={className}>
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