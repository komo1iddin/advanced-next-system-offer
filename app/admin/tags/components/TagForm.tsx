"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag } from "../lib/tag-service";
import { getUniqueCategories } from "../lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useState, useMemo, useEffect } from "react";

// Validation schema for tag form
const tagFormSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(100),
  category: z.string().optional(),
  active: z.boolean().default(true),
  newCategory: z.string().optional(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

interface TagFormProps {
  tag?: Tag;
  allTags: Tag[];
  onSubmit: (data: { name: string; category?: string; active: boolean }) => void;
  isSubmitting: boolean;
}

export default function TagForm({ tag, allTags, onSubmit, isSubmitting }: TagFormProps) {
  const [useNewCategory, setUseNewCategory] = useState(false);
  
  // Get unique categories from all tags
  const categories = useMemo(() => getUniqueCategories(allTags), [allTags]);
  
  // Initialize form with existing tag data or defaults
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: tag?.name || "",
      category: tag?.category || "General",
      active: tag?.active ?? true,
      newCategory: "",
    },
  });
  
  // Handle form submission
  const handleSubmit = (values: TagFormValues) => {
    onSubmit({
      name: values.name,
      category: useNewCategory && values.newCategory ? values.newCategory : values.category,
      active: values.active,
    });
  };
  
  // Reset useNewCategory when the tag changes
  useEffect(() => {
    setUseNewCategory(false);
  }, [tag]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
        
        {!useNewCategory ? (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "General"}
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
                <FormDescription>
                  The category this tag belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="newCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter new category name" {...field} />
                </FormControl>
                <FormDescription>
                  Create a new category for this tag.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUseNewCategory(!useNewCategory)}
          >
            {useNewCategory ? "Use Existing Category" : "Create New Category"}
          </Button>
        </div>
        
        <FormField
          control={form.control}
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
            {isSubmitting ? "Saving..." : tag ? "Update Tag" : "Add Tag"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
} 