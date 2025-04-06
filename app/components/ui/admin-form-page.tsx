"use client";

import React from "react";
import { 
  FormBase, 
  FormCard,
  FormSection
} from "@/app/components/forms";
import { 
  AdminPageLayout 
} from "@/components/ui/admin-page-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { UseFormReturn, FieldValues } from "react-hook-form";

export interface AdminFormPageProps<TFormValues extends FieldValues> {
  /** The title shown in the admin page header */
  title: string;
  
  /** Optional description for context */
  description?: string;
  
  /** Form schema for validation */
  schema: z.ZodType<TFormValues>;
  
  /** Default values for the form */
  defaultValues?: Partial<TFormValues>;
  
  /** Called when form is submitted and valid */
  onSubmit: (data: TFormValues) => Promise<void>;
  
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  
  /** The form section contents */
  children: React.ReactNode | ((form: UseFormReturn<TFormValues>) => React.ReactNode);
  
  /** Return URL when cancel is clicked */
  returnUrl: string;
  
  /** Custom submit button text */
  submitText?: string;
  
  /** Custom cancel button text */
  cancelText?: string;
  
  /** Form card title */
  formTitle?: string;
  
  /** Form card description */
  formDescription?: string;
  
  /** Additional classes for the form */
  className?: string;
}

/**
 * Standardized admin form page that combines AdminPageLayout with FormBase and FormCard
 */
export function AdminFormPage<TFormValues extends FieldValues>({
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  children,
  returnUrl,
  submitText = "Save",
  cancelText = "Cancel",
  formTitle,
  formDescription,
  className,
}: AdminFormPageProps<TFormValues>) {
  const router = useRouter();
  
  const handleCancel = () => {
    router.push(returnUrl);
  };
  
  const backButton = (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
      onClick={handleCancel}
    >
      <ChevronLeft size={16} />
      <span>Back</span>
    </Button>
  );
  
  return (
    <AdminPageLayout
      title={title}
      description={description}
      actionButton={backButton}
      cardTitle={formTitle || "Form"}
    >
      <FormBase<TFormValues>
        schema={schema}
        defaultValues={defaultValues as any}
        onSubmit={onSubmit}
        showFooter={false}
        isSubmitting={isSubmitting}
        className={cn("max-w-3xl mx-auto", className)}
      >
        {(form) => (
          <FormCard
            title={formTitle || title}
            description={formDescription}
            footer={
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {cancelText}
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : submitText}
                </Button>
              </div>
            }
          >
            {typeof children === 'function' ? children(form) : children}
          </FormCard>
        )}
      </FormBase>
    </AdminPageLayout>
  );
} 