import { useEffect, useState } from "react";
import { FormBase } from "@/app/components/forms/FormBase";
import { FormRow } from "@/app/components/forms/FormRow";
import { FormSection } from "@/app/components/forms/FormSection";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCities } from "@/hooks/use-cities";
import { universitySchema } from "@/app/components/forms/validation";
import { FormTemplateChildProps, FormTemplateProps, FormValuesFromSchema } from "./types";

export type UniversityFormValues = FormValuesFromSchema<typeof universitySchema>;

/**
 * University form template for creating or editing universities
 * Can be used directly with FormBase, FormModal, or as a standalone form
 */
export function UniversityFormTemplate({
  initialData,
  onSubmit,
  form: externalForm,
  isSubmitting = false,
  mode = "create",
  className,
}: FormTemplateProps<UniversityFormValues>) {
  // If we're used as a standalone form, create our own form instance
  if (!externalForm) {
    return (
      <FormBase
        schema={universitySchema}
        defaultValues={initialData}
        onSubmit={onSubmit}
        className={className}
      >
        {(form) => (
          <UniversityFormContent
            form={form}
            isSubmitting={isSubmitting}
            mode={mode}
          />
        )}
      </FormBase>
    );
  }

  // If we're used with an external form (like FormModal), use that form
  return (
    <UniversityFormContent
      form={externalForm}
      isSubmitting={isSubmitting}
      mode={mode}
      className={className}
    />
  );
}

/**
 * Internal component for the form's content
 */
function UniversityFormContent({
  form,
  isSubmitting,
  mode,
  className,
}: FormTemplateChildProps<UniversityFormValues>) {
  const { cities, isLoading: isLoadingCities } = useCities();

  return (
    <div className={className}>
      {/* Basic Information Section */}
      <FormSection title="Basic Information">
        <FormRow>
          <div className="col-span-6">
            <Label htmlFor="name">University Name*</Label>
            <Input 
              id="name" 
              {...form.register("name")}
              disabled={isSubmitting}
              placeholder="Enter university name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="col-span-6">
            <Label htmlFor="shortName">Short Name*</Label>
            <Input 
              id="shortName" 
              {...form.register("shortName")}
              disabled={isSubmitting}
              placeholder="Enter short name (e.g., MIT, UCLA)"
            />
            {form.formState.errors.shortName && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.shortName.message}
              </p>
            )}
          </div>
        </FormRow>

        {/* More fields would be here... */}
      </FormSection>

      {/* Contact Information Section */}
      <FormSection title="Contact Information">
        <FormRow>
          <div className="col-span-6">
            <Label htmlFor="email">Email*</Label>
            <Input 
              id="email" 
              type="email"
              {...form.register("email")}
              disabled={isSubmitting}
              placeholder="contact@university.edu"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          {/* More fields would be here... */}
        </FormRow>
      </FormSection>

      {/* Status Section */}
      <FormSection title="Status">
        <FormRow>
          <div className="col-span-full flex items-center space-x-2">
            <Switch
              id="active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </FormRow>
      </FormSection>
    </div>
  );
} 