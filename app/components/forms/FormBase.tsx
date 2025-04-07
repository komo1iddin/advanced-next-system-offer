"use client";

import React, { ReactNode } from "react";
import { useForm, UseFormReturn, FieldValues, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";

export interface FormBaseProps<TFieldValues extends FieldValues> {
  /**
   * Zod schema for form validation
   */
  schema: z.ZodType<TFieldValues>;

  /**
   * Default values for the form
   */
  defaultValues?: Partial<TFieldValues>;

  /**
   * Function called when the form is submitted and validation passes
   */
  onSubmit?: (values: TFieldValues) => void | Promise<void>;

  /**
   * Form render function that receives the form instance
   */
  children: (form: UseFormReturn<TFieldValues>) => ReactNode;

  /**
   * Optional className to apply to the form element
   */
  className?: string;

  /**
   * Whether to show the footer or not
   */
  showFooter?: boolean;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;

  /**
   * Function called when form cancel action is triggered
   */
  onCancel?: () => void;

  /**
   * Text for the submit button
   */
  submitText?: string;

  /**
   * Text for the cancel button
   */
  cancelText?: string;
}

/**
 * FormBase component provides form state management and validation
 * using react-hook-form and zod
 */
export function FormBase<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  showFooter = true,
  isSubmitting = false,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
}: FormBaseProps<TFieldValues>) {
  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const handleSubmit = async (data: TFieldValues) => {
    try {
      await onSubmit?.(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className={cn("space-y-6", className)}
        onSubmit={onSubmit ? form.handleSubmit(handleSubmit) : undefined}
      >
        {children(form)}
        
        {showFooter && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {cancelText}
              </Button>
            )}
            {onSubmit && (
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : submitText}
              </Button>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
} 