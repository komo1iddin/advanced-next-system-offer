import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

interface Province {
  _id: string;
  name: string;
  active: boolean;
}

interface ProvinceFormProps {
  initialData?: Province;
  onSubmit: (data: { name: string; active: boolean }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Validation schema
const provinceSchema = z.object({
  name: z.string().min(1, "Province name is required"),
});

export default function ProvinceForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: ProvinceFormProps) {
  const [form, setForm] = useState({ 
    name: initialData?.name || "", 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      provinceSchema.parse(form);
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
        <Label htmlFor="province-name">
          Province/State Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="province-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Zhejiang, Jiangsu, Shanghai"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name}</p>
        )}
      </div>
      
      {initialData && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="province-active"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="province-active">Active</Label>
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
            "Save Province"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
} 