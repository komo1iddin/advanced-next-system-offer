"use client";

import React from "react";
import { useForm, FormProvider, SubmitHandler, UseFormReturn, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormBaseProps<TFormValues extends FieldValues> {
  // The schema to validate the form
  schema: z.ZodType<TFormValues>;
  
  // Default values for the form
  defaultValues?: Partial<TFormValues>;
  
  // Callback when form is submitted and validated
  onSubmit: SubmitHandler<TFormValues>;
  
  // Form ID for accessibility
  id?: string;
  
  // Extra classes to apply to the form
  className?: string;
  
  // Whether the form is currently submitting
  isSubmitting?: boolean;
  
  // Children can be either React nodes or a function that receives form methods
  children: React.ReactNode | ((form: UseFormReturn<TFormValues>) => React.ReactNode);
  
  // Custom submit button text
  submitText?: string;
  
  // Custom cancel action
  onCancel?: () => void;
  
  // Custom cancel button text
  cancelText?: string;
  
  // Whether to show the footer with submit/cancel buttons
  showFooter?: boolean;
  
  // Position of the submit button
  submitPosition?: "left" | "right";
  
  // Additional props
  [key: string]: any;
}

export function FormBase<TFormValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  id,
  className,
  isSubmitting = false,
  children,
  submitText = "Submit",
  onCancel,
  cancelText = "Cancel",
  showFooter = true,
  submitPosition = "right",
  ...props
}: FormBaseProps<TFormValues>) {
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });
  
  const handleSubmit = async (data: TFormValues) => {
    await onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form 
        id={id} 
        className={cn("space-y-6", className)} 
        onSubmit={form.handleSubmit(handleSubmit)}
        {...props}
      >
        {typeof children === "function" ? children(form) : children}
        
        {showFooter && (
          <div className={cn(
            "flex gap-3 pt-3", 
            submitPosition === "right" ? "justify-end" : "justify-start"
          )}>
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
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitText}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
} 