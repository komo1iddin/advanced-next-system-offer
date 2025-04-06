"use client";

import { useState, useMemo, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Tag } from "../lib/tag-service";
import { getUniqueCategories } from "../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { 
  FormBase, 
  FormTextField, 
  FormSelectField, 
  FormSwitchField,
  FormSection,
  FormHelperText,
  validation
} from "@/app/components/forms";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Validation schema for tag form
const tagFormSchema = z.object({
  name: validation.requiredString("Tag name is required").max(100),
  category: validation.requiredString("Category is required"),
  active: z.boolean(),
  createMissingCategory: z.boolean(),
});

// Validation schema for category form
const categoryFormSchema = z.object({
  name: validation.requiredString("Category name is required").max(100),
  active: z.boolean(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface TagFormProps {
  tag?: Tag;
  allTags: Tag[];
  onSubmit: (data: { name: string; category?: string; active: boolean }) => void;
  isSubmitting: boolean;
}

export default function TagForm({ tag, allTags, onSubmit, isSubmitting }: TagFormProps) {
  const [activeTab, setActiveTab] = useState<string>("tag");
  
  // Get unique categories from all tags
  const categories = useMemo(() => getUniqueCategories(allTags), [allTags]);
  const hasCategoriesAvailable = categories.length > 0;
  
  // Default values for tag form
  const tagDefaultValues: TagFormValues = {
    name: tag?.name || "",
    category: tag?.category || (categories.length > 0 ? categories[0] : ""),
    active: tag?.active ?? true,
    createMissingCategory: categories.length === 0, // Auto-enable when no categories exist
  };
  
  // Default values for category form
  const categoryDefaultValues: CategoryFormValues = {
    name: "",
    active: true,
  };
  
  // Handle tag form submission
  const handleTagSubmit = (values: TagFormValues) => {
    const { name, category, active, createMissingCategory } = values;
    
    // If no categories exist or createMissingCategory is enabled 
    // and the category doesn't match any existing category,
    // we'll create both the category and the tag
    if ((categories.length === 0 || createMissingCategory) && !categories.includes(category)) {
      onSubmit({
        name: name,
        category: category, // Use the provided category name
        active: active,
      });
    } else {
      onSubmit({
        name: name,
        category: category,
        active: active,
      });
    }
  };
  
  // Handle category form submission - creates a tag with the category name
  const handleCategorySubmit = (values: CategoryFormValues) => {
    onSubmit({
      name: values.name, // Category name becomes the tag name
      category: values.name, // And also the category
      active: values.active,
    });
  };
  
  // Auto switch to category tab if no categories exist
  useEffect(() => {
    if (categories.length === 0 && !tag) {
      setActiveTab("category");
    }
  }, [categories, tag]);

  // Prepare category options for select field
  const categoryOptions = categories.map(category => ({
    label: category,
    value: category
  }));
  
  // Render tag form content
  const renderTagForm = (form: UseFormReturn<TagFormValues>) => (
    <>
      {!hasCategoriesAvailable && (
        <Alert className="bg-blue-50 mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No categories found. You can create a new tag with a category, and both will be created.
          </AlertDescription>
        </Alert>
      )}
    
      <FormSection>
        <FormTextField
          name="name"
          label="Tag Name"
          placeholder="Enter tag name"
          required
          disabled={isSubmitting}
          description="The name of the tag as it will appear in the system."
        />
        
        {hasCategoriesAvailable ? (
          <FormSelectField
            name="category"
            label="Category"
            options={categoryOptions}
            required
            disabled={isSubmitting}
            description="The category this tag belongs to."
          />
        ) : (
          <FormTextField
            name="category"
            label="Category"
            placeholder="Enter new category name"
            required
            disabled={isSubmitting}
            description="Enter a new category name. This will create both the category and tag."
          />
        )}
      </FormSection>
      
      {hasCategoriesAvailable && (
        <FormSwitchField
          name="createMissingCategory"
          label="Create New Categories"
          disabled={isSubmitting}
          description="Allow entering custom category names to create new categories."
        />
      )}
      
      <FormSwitchField
        name="active"
        label="Active"
        disabled={isSubmitting}
        description="Only active tags will be available for selection in forms."
      />

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tag ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </>
  );
  
  // Render category form content
  const renderCategoryForm = (form: UseFormReturn<CategoryFormValues>) => (
    <>
      <FormSection>
        <FormTextField
          name="name"
          label="Category Name"
          placeholder="Enter category name"
          required
          disabled={isSubmitting}
          description="The name of the new category. A tag with the same name will also be created."
        />
        
        <FormSwitchField
          name="active"
          label="Active"
          disabled={isSubmitting}
          description="Only active categories and tags will be available for selection."
        />
      </FormSection>

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Category
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Tabs defaultValue="tag" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tag">Create Tag</TabsTrigger>
        <TabsTrigger value="category">Create Category</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tag" className="mt-4">
        <FormBase<TagFormValues>
          schema={tagFormSchema}
          defaultValues={tagDefaultValues}
          onSubmit={handleTagSubmit}
          showFooter={false}
        >
          {renderTagForm}
        </FormBase>
      </TabsContent>
      
      <TabsContent value="category" className="mt-4">
        <FormBase<CategoryFormValues>
          schema={categoryFormSchema}
          defaultValues={categoryDefaultValues}
          onSubmit={handleCategorySubmit}
          showFooter={false}
        >
          {renderCategoryForm}
        </FormBase>
      </TabsContent>
    </Tabs>
  );
} 