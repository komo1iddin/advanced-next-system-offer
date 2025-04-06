"use client";

import { AdminFormPage } from "@/app/components/ui/admin-form-page";
import { useState } from "react";
import { z } from "zod";
import { 
  FormRow, 
  FormSection, 
  FormSpacer, 
  FormDivider,
  FormHelperText,
  FormTextField,
  FormSelectField,
  FormSwitchField,
  FormDateField,
  FormTextareaField,
  FormFileField,
  validation
} from "@/app/components/forms";
import { toast } from "sonner";

// Course form validation schema
const courseSchema = z.object({
  // Basic info
  title: validation.requiredString("Course title is required"),
  shortDescription: validation.stringWithLength(0, 150, undefined, "Cannot exceed 150 characters"),
  
  // Course details
  category: z.string().min(1, { message: "Please select a category" }),
  startDate: validation.requiredDate("Start date is required"),
  endDate: validation.requiredDate("End date is required"),
  price: validation.positiveNumber("Price must be a positive number"),
  isPublished: z.boolean(),
  
  // Content
  fullDescription: validation.requiredString("Full description is required"),
  prerequisites: z.string().optional(),
  
  // Optional details
  tags: z.string().optional(),
  image: z.any().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CourseFormValues = z.infer<typeof courseSchema>;

const defaultValues: Partial<CourseFormValues> = {
  title: "",
  shortDescription: "",
  category: "",
  isPublished: false,
  price: 0,
  fullDescription: "",
  prerequisites: "",
  tags: ""
};

const CATEGORIES = [
  { label: "Development", value: "development" },
  { label: "Business", value: "business" },
  { label: "Finance", value: "finance" },
  { label: "IT & Software", value: "it-software" },
  { label: "Marketing", value: "marketing" },
  { label: "Design", value: "design" },
];

export default function AdminFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      console.log("Submitting form data:", data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Course created successfully!");
    } catch (error) {
      toast.error("Failed to create course");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminFormPage
      title="Create New Course"
      description="Add a new course to your academy"
      schema={courseSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      returnUrl="/admin/courses"
      submitText="Create Course"
      formTitle="Course Information"
      formDescription="Fill in all required fields to create a new course"
    >
      <FormSection title="Basic Information">
        <FormTextField
          name="title"
          label="Course Title"
          required
        />
        <FormHelperText>
          Make it clear and catchy to attract students
        </FormHelperText>
        
        <FormTextareaField
          name="shortDescription"
          label="Short Description"
          rows={2}
          maxLength={150}
          placeholder="Brief overview of the course (max 150 chars)"
        />
      </FormSection>
      
      <FormDivider label="Course Details" spacing="large" />
      
      <FormSection>
        <FormRow columns={2}>
          <FormSelectField
            name="category"
            label="Category"
            options={CATEGORIES}
            required
          />
          <FormTextField
            name="price"
            label="Price ($)"
            required
          />
        </FormRow>
        
        <FormRow columns={2}>
          <FormDateField
            name="startDate"
            label="Start Date"
            required
          />
          <FormDateField
            name="endDate"
            label="End Date"
            required
          />
        </FormRow>
        
        <FormSwitchField
          name="isPublished"
          label="Publish Immediately"
        />
        <FormHelperText variant="tip">
          Toggle off to save as draft
        </FormHelperText>
      </FormSection>
      
      <FormSpacer size="large" />
      
      <FormSection title="Course Content">
        <FormTextareaField
          name="fullDescription"
          label="Full Description"
          rows={6}
          required
          placeholder="Detailed course description with outcomes, curriculum overview, etc."
        />
        
        <FormTextareaField
          name="prerequisites"
          label="Prerequisites"
          rows={3}
          placeholder="Any skills or knowledge students should have before taking this course"
        />
      </FormSection>
      
      <FormDivider label="Additional Information" />
      
      <FormSection>
        <FormTextField
          name="tags"
          label="Tags"
          placeholder="Comma-separated tags (e.g. programming, web development, javascript)"
        />
        
        <FormFileField
          name="image"
          label="Course Image"
          accept="image/*"
          description="Recommended size: 1280x720 pixels (16:9 ratio)"
        />
        <FormHelperText variant="warning">
          Images larger than 10MB will be rejected
        </FormHelperText>
      </FormSection>
    </AdminFormPage>
  );
} 