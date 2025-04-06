"use client";

import { z } from "zod";
import { 
  FormBase, 
  FormTextField, 
  FormSwitchField 
} from "@/app/components/forms";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

export interface Province {
  _id: string;
  name: string;
  active: boolean;
}

export interface ProvinceFormProps {
  initialData?: Province;
  onSubmit: (data: { name: string; active: boolean }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Define the validation schema
const formSchema = z.object({
  name: z.string().min(1, "Province name is required"),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProvinceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProvinceFormProps) {
  // Default values for the form
  const defaultValues: FormValues = {
    name: initialData?.name || "",
    active: initialData?.active ?? true
  };

  // Form content renderer
  const renderForm = (form: UseFormReturn<FormValues>) => (
    <>
      <div className="space-y-4 py-2 pb-4">
        <FormTextField
          name="name"
          label="Province/State Name"
          placeholder="e.g. Zhejiang, Jiangsu, Shanghai"
          required
          disabled={isSubmitting}
        />
        
        {initialData && (
          <FormSwitchField
            name="active"
            label="Active"
            disabled={isSubmitting}
          />
        )}
      </div>

      <DialogFooter>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting || !form.formState.isDirty} 
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </>
  );
  
  return (
    <FormBase<FormValues>
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      showFooter={false}
    >
      {renderForm}
    </FormBase>
  );
} 