import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, children, className = "" }: FormSectionProps) {
  return (
    <div className={`space-y-4 md:col-span-2 ${className}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  );
} 