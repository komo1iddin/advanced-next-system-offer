"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

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
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`space-y-2 ${className}`}>
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
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled || form.formState.isSubmitting}
              className="resize-vertical"
              rows={rows}
              maxLength={maxLength}
              {...field}
            />
          </FormControl>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 