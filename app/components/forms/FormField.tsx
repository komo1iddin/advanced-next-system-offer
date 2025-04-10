"use client";

import React from "react";
import { Controller, useFormContext, ControllerRenderProps, ControllerFieldState, UseFormStateReturn, FieldValues, FieldPath } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
  name: TName;
  control?: any;
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
}

export function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ 
  name, 
  control, 
  render 
}: FormFieldProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  const formControl = control || form.control;

  return (
    <Controller
      name={name}
      control={formControl}
      render={render}
    />
  );
}

export interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export function FormItem({ children, className }: FormItemProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

export interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({ children, className }: FormLabelProps) {
  return (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
      {children}
    </label>
  );
}

export interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
  name?: string;
}

export function FormMessage({ children, className, name }: FormMessageProps) {
  const form = useFormContext();
  const fieldName = name || '';
  const fieldError = fieldName ? form.formState.errors[fieldName] : null;
  
  // Use provided children or field error message
  const message = children || (fieldError?.message as React.ReactNode);
  
  if (!message) return null;

  return (
    <p className={cn("text-sm font-medium text-destructive mt-1", className)}>
      {message}
    </p>
  );
} 