"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  name: string;
  control?: any;
  render: (props: any) => React.ReactNode;
}

export function FormField({ name, control, render }: FormFieldProps) {
  const form = useFormContext();
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
}

export function FormMessage({ children, className }: FormMessageProps) {
  const form = useFormContext();
  const error = form.formState.errors[form.formState.errors[0]?.name || ""];

  if (!error) return null;

  return (
    <p className={cn("text-sm font-medium text-destructive", className)}>
      {error.message}
    </p>
  );
} 