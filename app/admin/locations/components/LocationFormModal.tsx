"use client";

import { z } from "zod";
import { FormModal } from "@/app/components/forms";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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

// Province form schemas and types
const provinceSchema = z.object({
  name: z.string().min(1, "Province name is required"),
  active: z.boolean(),
});

type ProvinceFormValues = z.infer<typeof provinceSchema>;

// City form schemas and types
const citySchema = z.object({
  name: z.string().min(1, "City name is required"),
  provinceId: z.string().min(1, "Province is required"),
  active: z.boolean(),
});

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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>
                    Province/State Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Zhejiang, Jiangsu, Shanghai"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {mode === "edit" && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 mt-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  City Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Shanghai, Hangzhou, Suzhou"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="provinceId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  Province <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province._id} value={province._id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {mode === "edit" && (
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 mt-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Active</FormLabel>
                </FormItem>
              )}
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