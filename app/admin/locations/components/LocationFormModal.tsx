"use client";

import { FormModal, validation, FormTextField, FormSelectField, FormSwitchField } from "@/app/components/forms";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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

// Use the validation library for schemas
const provinceSchema = validation.provinceSchema;
type ProvinceFormValues = z.infer<typeof provinceSchema>;

const citySchema = validation.citySchema;
type CityFormValues = z.infer<typeof citySchema>;

// Types of location entity
export type LocationEntityType = "province" | "city";

// Props for the Location form modal
export interface LocationFormModalProps {
  // The trigger button
  children?: React.ReactNode;
  
  // Type of location entity
  entityType: LocationEntityType;
  
  // Whether in create or edit mode
  mode: "create" | "edit";
  
  // The provinces list (needed for city selection)
  provinces: Province[];
  
  // Initial data for editing
  initialData?: Province | City;
  
  // Callback when form is submitted and validated
  onSubmit: (data: ProvinceFormValues | CityFormValues) => Promise<void>;
  
  // Whether the form is submitting
  isSubmitting?: boolean;
  
  // Open state control
  open?: boolean;
  
  // Open state change handler 
  onOpenChange?: (open: boolean) => void;
}

export function LocationFormModal({
  children,
  entityType,
  mode,
  provinces,
  initialData,
  onSubmit,
  isSubmitting = false,
  open,
  onOpenChange,
}: LocationFormModalProps) {
  // Determine entity labels based on type
  const entityLabels = {
    singular: entityType === "province" ? "Province" : "City",
    plural: entityType === "province" ? "Provinces" : "Cities"
  };
  
  // Default values for province form
  const provinceDefaultValues: ProvinceFormValues = {
    name: (initialData as Province)?.name || "",
    active: (initialData as Province)?.active ?? true
  };
  
  // Default values for city form
  const cityDefaultValues: CityFormValues = {
    name: (initialData as City)?.name || "",
    provinceId: (initialData as City)?.provinceId?._id || "",
    active: (initialData as City)?.active ?? true
  };
  
  // Format provinces for the select field
  const provinceOptions = provinces.map(province => ({
    value: province._id,
    label: province.name
  }));
  
  if (entityType === "province") {
    return (
      <FormModal<ProvinceFormValues>
        mode={mode}
        entityLabels={entityLabels}
        schema={provinceSchema}
        defaultValues={provinceDefaultValues}
        onSubmit={onSubmit as (data: ProvinceFormValues) => Promise<void>}
        isSubmitting={isSubmitting}
        open={open}
        onOpenChange={onOpenChange}
        renderForm={(form) => (
          <>
            <FormTextField
              name="name"
              label="Province/State Name"
              placeholder="e.g. Zhejiang, Jiangsu, Shanghai"
              required
              disabled={isSubmitting}
            />
            
            {mode === "edit" && (
              <FormSwitchField
                name="active"
                label="Active"
                disabled={isSubmitting}
              />
            )}
          </>
        )}
      >
        {children || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {mode === "create" ? "Add" : "Edit"} Province
          </Button>
        )}
      </FormModal>
    );
  }
  
  return (
    <FormModal<CityFormValues>
      mode={mode}
      entityLabels={entityLabels}
      schema={citySchema}
      defaultValues={cityDefaultValues}
      onSubmit={onSubmit as (data: CityFormValues) => Promise<void>}
      isSubmitting={isSubmitting}
      open={open}
      onOpenChange={onOpenChange}
      renderForm={(form) => (
        <>
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
          
          {mode === "edit" && (
            <FormSwitchField
              name="active"
              label="Active"
              disabled={isSubmitting}
            />
          )}
        </>
      )}
    >
      {children || (
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {mode === "create" ? "Add" : "Edit"} City
        </Button>
      )}
    </FormModal>
  );
} 