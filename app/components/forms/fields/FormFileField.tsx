"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormMessage } from "@/app/components/forms/FormField";

export interface FormFileFieldProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in megabytes
  showPreview?: boolean;
}

/**
 * Standardized file upload field component for forms
 */
export default function FormFileField({
  name,
  label,
  required = false,
  disabled = false,
  className = "",
  description,
  accept,
  multiple = false,
  maxSize = 10, // Default 10MB
  showPreview = true,
}: FormFileFieldProps) {
  const form = useFormContext();
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      form.setValue(name, multiple ? [] : null);
      setPreviews([]);
      return;
    }

    // Check file sizes
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > maxSize * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      form.setError(name, {
        type: "manual",
        message: `File${oversizedFiles.length > 1 ? 's' : ''} exceed${oversizedFiles.length === 1 ? 's' : ''} maximum size of ${maxSize}MB`,
      });
      e.target.value = "";
      return;
    }

    // Process files for preview if they are images
    if (showPreview) {
      const newPreviews: string[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              setPreviews(prev => [...prev, result]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
      
      if (newPreviews.length > 0) {
        setPreviews(newPreviews);
      }
    }

    form.setValue(name, multiple ? Array.from(files) : files[0], { 
      shouldValidate: true 
    });
  };

  const clearFiles = () => {
    form.setValue(name, multiple ? [] : null, { shouldValidate: true });
    setPreviews([]);
    // Also reset the input
    const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}{" "}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled || form.formState.isSubmitting}
                className="hidden"
                id={`file-input-${name}`}
                onChange={handleFileChange}
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`file-input-${name}`)?.click()}
                disabled={disabled || form.formState.isSubmitting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>Choose {multiple ? "files" : "file"}</span>
              </Button>
              
              {(field.value && (
                multiple ? (field.value as File[]).length > 0 : true
              )) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
              
              <div className="text-sm text-muted-foreground">
                {multiple ? (
                  (field.value as File[])?.length > 0 ? (
                    <span>{(field.value as File[]).length} file(s) selected</span>
                  ) : "No files chosen"
                ) : (
                  (field.value as File)?.name || "No file chosen"
                )}
              </div>
            </div>
            
            {showPreview && previews.length > 0 && (
              <div className={cn(
                "flex gap-2 mt-2",
                multiple ? "flex-wrap" : "justify-center"
              )}>
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded border overflow-hidden"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 