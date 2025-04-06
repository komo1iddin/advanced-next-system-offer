"use client";

import { useState } from "react";
import { FormModal } from "@/app/components/forms/FormModal";
import { tagSchema } from "@/app/components/forms/validation";
import { TagFormTemplate, TagFormValues } from "@/app/components/forms/templates";

interface Tag {
  id: string;
  name: string;
  active: boolean;
}

interface TagModalProps {
  children: React.ReactNode;
  tag?: Tag; // Optional: if provided, we're in edit mode
  mode: "add" | "edit";
  onSubmit?: (data: TagFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function TagModal({ 
  children, 
  tag, 
  mode,
  onSubmit: externalSubmit,
  isSubmitting = false 
}: TagModalProps) {
  const [open, setOpen] = useState(false);
  
  // Default values for the form
  const defaultValues: Partial<TagFormValues> = {
    name: tag?.name || "",
    active: tag?.active ?? true,
  };

  // Handle form submission
  const handleSubmit = async (values: TagFormValues) => {
    if (externalSubmit) {
      await externalSubmit(values);
    }
    // Close the modal on successful submission
    setOpen(false);
  };

  // Entity labels for FormModal
  const entityLabels = {
    singular: "Tag",
    plural: "Tags"
  };
  
  return (
    <FormModal<TagFormValues>
      mode={mode === "add" ? "create" : "edit"}
      entityLabels={entityLabels}
      schema={tagSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      open={open}
      onOpenChange={setOpen}
      renderForm={(form) => (
        <TagFormTemplate 
          form={form}
          mode={mode === "add" ? "create" : "edit"}
          isSubmitting={isSubmitting}
        />
      )}
    >
      {children}
    </FormModal>
  );
} 