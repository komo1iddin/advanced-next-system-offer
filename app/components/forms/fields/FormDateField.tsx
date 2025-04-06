"use client";

import { useFormContext } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormMessage } from "@/app/components/forms/FormField";

export interface FormDateFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

/**
 * Standardized date field component for forms
 */
export default function FormDateField({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  description,
}: FormDateFieldProps) {
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
                disabled={disabled || form.formState.isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabled || form.formState.isSubmitting}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 