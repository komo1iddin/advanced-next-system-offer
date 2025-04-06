"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

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
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem 
          className={`flex flex-row items-center space-x-2 ${className}`}
        >
          {!reversed && (
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled || form.formState.isSubmitting}
              />
            </FormControl>
          )}
          <div className="space-y-0.5">
            <FormLabel className="!mt-0">{label}</FormLabel>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {reversed && (
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled || form.formState.isSubmitting}
              />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 