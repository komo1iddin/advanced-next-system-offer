import { FormBase } from "@/app/components/forms/FormBase";
import { FormRow } from "@/app/components/forms/FormRow";
import { FormSection } from "@/app/components/forms/FormSection";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Spinner } from "@/app/components/ui/spinner";
import { tagSchema } from "@/app/components/forms/validation";
import { FormTemplateChildProps, FormTemplateProps, FormValuesFromSchema } from "./types";

export type TagFormValues = FormValuesFromSchema<typeof tagSchema>;

/**
 * Tag form template for creating or editing tags
 * Can be used directly with FormBase, FormModal, or as a standalone form
 */
export function TagFormTemplate({
  initialData,
  onSubmit,
  form: externalForm,
  isSubmitting = false,
  mode = "create",
  className,
}: FormTemplateProps<TagFormValues>) {
  // If we're used as a standalone form, create our own form instance
  if (!externalForm) {
    return (
      <FormBase
        schema={tagSchema}
        defaultValues={initialData}
        onSubmit={onSubmit}
        className={className}
      >
        {(form) => (
          <TagFormContent
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
    <TagFormContent
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
function TagFormContent({
  form,
  isSubmitting,
  mode,
  className,
}: FormTemplateChildProps<TagFormValues>) {
  return (
    <div className={className}>
      <FormSection title="Tag Information">
        <FormRow>
          <div className="col-span-full">
            <Label htmlFor="name">Tag Name*</Label>
            <Input 
              id="name" 
              {...form.register("name")}
              disabled={isSubmitting}
              placeholder="Enter tag name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
        </FormRow>

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

      {/* Only show submit button if we're part of a standalone form */}
      {/* This is to be compatible with FormBase */}
    </div>
  );
} 