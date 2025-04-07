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
  FormTextField, 
  FormSelectField, 
  FormSwitchField,
  FormSection,
  FormHelperText,
  validation
} from "@/app/components/forms";

// Validation schema for tag form
const tagFormSchema = z.object({
  name: validation.requiredString("Tag name is required").max(100),
  category: validation.requiredString("Category is required"),
  active: z.boolean(),
  createMissingCategory: z.boolean().optional().default(false),
});

// Validation schema for category form
const categoryFormSchema = z.object({
  name: validation.requiredString("Category name is required").max(100),
  active: z.boolean(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface TagFormContentProps {
  form: UseFormReturn<any>;
  tags: Tag[];
  mode: "create" | "edit";
}

// Export static properties for use by parent components
const TagForm = {
  schema: tagFormSchema,
  
  getDefaultValues: (tag?: Tag) => {
    // Get unique categories from all available tags
    const categories = tag ? [tag.category] : [];
    
    return {
      name: tag?.name || "",
      category: tag?.category || "",
      active: tag?.active ?? true,
      createMissingCategory: false, 
    };
  },
  
  Content: ({ form, tags, mode }: TagFormContentProps) => {
    const [activeTab, setActiveTab] = useState<string>("tag");
    
    // Get unique categories from all tags
    const categories = useMemo(() => getUniqueCategories(tags), [tags]);
    const hasCategoriesAvailable = categories.length > 0;

    // Auto switch to category tab if no categories exist
    useEffect(() => {
      if (categories.length === 0 && mode === "create") {
        setActiveTab("category");
      }
    }, [categories, mode]);

    // Prepare category options for select field
    const categoryOptions = categories.map(category => ({
      label: category,
      value: category
    }));
    
    // Handle when user selects the category tab
    const handleCategoryTabSelect = () => {
      // If on category tab, set formValues for creating a category
      if (form.getValues) {
        const currentValues = form.getValues();
        form.setValue("name", ""); // Reset name for new category
        form.setValue("category", ""); // Reset category field for new category
      }
    };

    // Handle when user selects the tag tab
    const handleTagTabSelect = () => {
      // No special handling needed when switching back to tag tab
    };

    const handleTabChange = (value: string) => {
      if (value === "category") {
        handleCategoryTabSelect();
      } else {
        handleTagTabSelect();
      }
      setActiveTab(value);
    };
    
    return (
      <Tabs defaultValue="tag" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tag">{mode === "edit" ? "Edit Tag" : "Create Tag"}</TabsTrigger>
          <TabsTrigger value="category">Create Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tag" className="mt-4">
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
              description="The name of the tag as it will appear in the system."
            />
            
            {hasCategoriesAvailable ? (
              <>
                <FormSelectField
                  name="category"
                  label="Category"
                  options={categoryOptions}
                  required
                  description="The category this tag belongs to."
                />
                <FormSwitchField
                  name="createMissingCategory"
                  label="Create New Category"
                  description="If checked and you enter a new category name, it will be created as a new category."
                />
              </>
            ) : (
              <FormTextField
                name="category"
                label="Category"
                placeholder="Enter new category name"
                required
                description="Enter a new category name. This will create both the category and tag."
              />
            )}
          </FormSection>
          
          <FormSwitchField
            name="active"
            label="Active"
            description="Only active tags will be available for selection in forms."
          />
        </TabsContent>
        
        <TabsContent value="category" className="mt-4">
          <FormSection>
            <FormTextField
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              required
              description="The name of the new category. A tag with the same name will also be created."
            />
            
            <FormSwitchField
              name="active"
              label="Active"
              description="Only active categories and tags will be available for selection."
            />
          </FormSection>
        </TabsContent>
      </Tabs>
    );
  }
};

export default TagForm; 