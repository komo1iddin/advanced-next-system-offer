"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag } from "../lib/tag-service";
import { getUniqueCategories } from "../lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import { Info } from "lucide-react";

// Validation schema for tag form
const tagFormSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(100),
  category: z.string().min(1, "Category is required"),
  active: z.boolean().default(true),
  createMissingCategory: z.boolean().default(false),
});

// Validation schema for category form
const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  active: z.boolean().default(true),
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
  
  // Initialize tag form
  const tagForm = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: tag?.name || "",
      category: tag?.category || (categories.length > 0 ? categories[0] : ""),
      active: tag?.active ?? true,
      createMissingCategory: categories.length === 0, // Auto-enable when no categories exist
    },
  });
  
  // Initialize category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });
  
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
  
  // Reset forms when the tag changes
  useEffect(() => {
    if (tag) {
      tagForm.reset({
        name: tag.name,
        category: tag.category,
        active: tag.active,
        createMissingCategory: false,
      });
      setActiveTab("tag"); // Always show tag tab when editing
    }
  }, [tag, tagForm]);

  return (
    <Tabs defaultValue="tag" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tag">Create Tag</TabsTrigger>
        <TabsTrigger value="category">Create Category</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tag" className="mt-4">
        <Form {...tagForm}>
          <form onSubmit={tagForm.handleSubmit(handleTagSubmit)} className="space-y-4">
            {!hasCategoriesAvailable && (
              <Alert className="bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No categories found. You can create a new tag with a category, and both will be created.
                </AlertDescription>
              </Alert>
            )}
          
            <FormField
              control={tagForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tag name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the tag as it will appear in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={tagForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {hasCategoriesAvailable ? (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input 
                        placeholder="Enter new category name" 
                        {...field} 
                      />
                    </FormControl>
                  )}
                  <FormDescription>
                    {hasCategoriesAvailable 
                      ? "The category this tag belongs to."
                      : "Enter a new category name. This will create both the category and tag."
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {hasCategoriesAvailable && (
              <FormField
                control={tagForm.control}
                name="createMissingCategory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 rounded-md border p-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel>Create New Categories</FormLabel>
                      <FormDescription>
                        Allow entering custom category names to create new categories.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={tagForm.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Only active tags will be available for selection in forms.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : tag ? "Update Tag" : "Create Tag"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="category" className="mt-4">
        <Form {...categoryForm}>
          <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
            <FormField
              control={categoryForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the new category. This will also create a tag with the same name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={categoryForm.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Only active categories will be available for selection when creating tags.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
} 