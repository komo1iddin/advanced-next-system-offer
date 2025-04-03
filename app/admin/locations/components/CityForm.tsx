import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

interface Province {
  _id: string;
  name: string;
  active: boolean;
}

interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
  };
  active: boolean;
}

interface CityFormProps {
  provinces: Province[];
  initialData?: City;
  onSubmit: (data: { name: string; provinceId: string; active: boolean }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Validation schema
const citySchema = z.object({
  name: z.string().min(1, "City name is required"),
  provinceId: z.string().min(1, "Province is required"),
});

export default function CityForm({ 
  provinces, 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: CityFormProps) {
  const [form, setForm] = useState({ 
    name: initialData?.name || "", 
    provinceId: initialData?.provinceId?._id || "",
    active: initialData?.active ?? true 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleProvinceSelect = (value: string) => {
    setForm((prev) => ({
      ...prev,
      provinceId: value,
    }));
    
    // Clear error for this field if it exists
    if (errors.provinceId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.provinceId;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      citySchema.parse(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }
    
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="city-name">
          City Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="city-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Shanghai, Hangzhou, Suzhou"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="province-select">
          Province <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={form.provinceId} 
          onValueChange={handleProvinceSelect}
          disabled={isSubmitting}
        >
          <SelectTrigger id="province-select">
            <SelectValue placeholder="Select a province" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province._id} value={province._id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.provinceId && (
          <p className="text-red-500 text-sm">{errors.provinceId}</p>
        )}
      </div>
      
      {initialData && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="city-active"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="city-active">Active</Label>
        </div>
      )}
      
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Saving...</span>
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Save City"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
} 