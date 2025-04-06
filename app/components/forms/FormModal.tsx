"use client";

import React from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { z } from "zod";
import { FormBase, FormBaseProps } from "./FormBase";
import { ModalBase, ModalBaseProps } from "../modals/ModalBase";
import { useFormMode, UseFormModeOptions } from "./useFormMode";

export type FormMode = "create" | "edit";

export interface FormModalProps<TFormValues extends FieldValues> 
  extends Omit<FormBaseProps<TFormValues>, "children">, 
          Omit<ModalBaseProps, "content" | "title" | "description"> {
  /**
   * The form mode (create or edit)
   */
  mode: FormMode;
  
  /**
   * Labels for the entity being created/edited
   */
  entityLabels: {
    singular: string;
    plural?: string;
  };
  
  /**
   * Render function for the form fields
   */
  renderForm: (form: UseFormReturn<TFormValues>) => React.ReactNode;
  
  /**
   * Whether the modal should auto-close after successful submission
   */
  autoCloseOnSuccess?: boolean;
  
  /**
   * Custom text for form actions
   */
  formText?: {
    create?: string;
    edit?: string;
    submit?: string;
    cancel?: string;
  };
}

export function FormModal<TFormValues extends FieldValues>({
  mode,
  entityLabels,
  schema,
  defaultValues,
  onSubmit,
  renderForm,
  size = "md",
  className,
  isSubmitting = false,
  children,
  open,
  onOpenChange,
  defaultOpen,
  footer,
  autoCloseOnSuccess = true,
  formText = {},
  submitText,
  cancelText = "Cancel",
  ...props
}: FormModalProps<TFormValues>) {
  // Get form mode utils for consistent text
  const formMode = useFormMode({
    mode,
    entityLabels,
    verbs: {
      create: formText.create,
      edit: formText.edit,
    }
  });
  
  // Handler for form submission
  const handleSubmit = async (data: TFormValues) => {
    await onSubmit(data);
    
    // Auto-close modal if configured
    if (autoCloseOnSuccess && onOpenChange) {
      onOpenChange(false);
    }
  };
  
  // Derive submit text from mode if not provided
  const finalSubmitText = submitText || 
    formText.submit || 
    formMode.actionText;

  return (
    <ModalBase
      title={formMode.titleText}
      description={formMode.descriptionText}
      size={size}
      className={className}
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      footer={footer}
      content={(close) => (
        <FormBase
          schema={schema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={close}
          submitText={finalSubmitText}
          cancelText={cancelText}
          showFooter={!footer} // Don't show form footer if modal footer is provided
          {...props}
        >
          {(form) => renderForm(form)}
        </FormBase>
      )}
    >
      {children}
    </ModalBase>
  );
} 