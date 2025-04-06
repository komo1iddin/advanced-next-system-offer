"use client";

import { 
  FormBase, 
  FormTextField, 
  FormSelectField, 
  FormSwitchField,
  validation
} from "@/app/components/forms";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export interface Province {
  _id: string;
  name: string;
  active: boolean;
}

export interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
  };
  active: boolean;
}

export interface CityFormProps {
  provinces: Province[];
  initialData?: City;
  onSubmit: (data: { name: string; provinceId: string; active: boolean }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Use the validation library schema
const formSchema = validation.citySchema;
type FormValues = z.infer<typeof formSchema>;

export default function CityForm({
  provinces,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CityFormProps) {
  // Default values for the form
  const defaultValues: FormValues = {
    name: initialData?.name || "",
    provinceId: initialData?.provinceId?._id || "",
    active: initialData?.active ?? true
  };

  // Format provinces for the select field
  const provinceOptions = provinces.map(province => ({
    value: province._id,
    label: province.name
  }));

  // Form content renderer
  const renderForm = (form: UseFormReturn<FormValues>) => (
    <>
      <div className="space-y-4 py-2 pb-4">
        <FormTextField
          name="name"
          label="City Name"
          placeholder="e.g. Shanghai, Hangzhou, Suzhou"
          required
          disabled={isSubmitting}
        />
        
        <FormSelectField
          name="provinceId"
          label="Province"
          placeholder="Select a province"
          options={provinceOptions}
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