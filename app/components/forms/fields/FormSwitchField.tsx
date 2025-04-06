"use client";

import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormMessage } from "@/app/components/forms/FormField";

export interface FormSwitchFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  className?: string;
  description?: string;
  reversed?: boolean;
}

/**
 * Standardized switch field component for forms
 */
export default function FormSwitchField({
  name,
  label,
  disabled = false,
  className = "",
  description,
  reversed = false,
}: FormSwitchFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem 
          className={cn("flex flex-row items-center space-x-2", className)}
        >
          {!reversed && (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled || form.formState.isSubmitting}
            />
          )}
          <div className="space-y-0.5">
            <FormLabel className="!mt-0">{label}</FormLabel>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {reversed && (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled || form.formState.isSubmitting}
            />
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 