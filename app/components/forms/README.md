# Form and Modal Component System

This directory contains a standardized system for creating consistent forms and modals throughout the application.

## Overview

The system consists of:

1. **FormBase**: A reusable form component built on top of react-hook-form and zod validation
2. **ModalBase**: A standardized modal component with various configuration options
3. **FormModal**: A combination of FormBase and ModalBase for the common pattern of forms within modals
4. **useFormMode**: A utility hook for handling consistent text and behavior for create/edit forms

## Components

### FormBase

A comprehensive form component that handles validation, errors, and submission.

**Usage:**

```tsx
import { FormBase } from "@/app/components/forms";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define schema with zod
const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

// Define form types
type FormValues = z.infer<typeof formSchema>;

export function MyForm() {
  const handleSubmit = async (data: FormValues) => {
    // Handle submission
    console.log(data);
  };

  return (
    <FormBase
      schema={formSchema}
      defaultValues={{ name: "", email: "" }}
      onSubmit={handleSubmit}
      submitText="Submit"
      isSubmitting={false}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormBase>
  );
}
```

### ModalBase

A standardized modal component that handles open/close state, sizing, and consistent structure.

**Usage:**

```tsx
import { ModalBase } from "@/app/components/forms";
import { Button } from "@/components/ui/button";

export function MyModal() {
  return (
    <ModalBase
      title="My Modal"
      description="This is a sample modal"
      size="md"
      content={
        <div className="space-y-4">
          <p>Modal content goes here...</p>
          <p>You can include any React components.</p>
        </div>
      }
      footer={
        <Button variant="outline" size="sm">
          Close
        </Button>
      }
    >
      <Button>Open Modal</Button>
    </ModalBase>
  );
}
```

### FormModal

A combination of FormBase and ModalBase that handles the common pattern of forms within modals.

**Usage:**

```tsx
import { FormModal } from "@/app/components/forms";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define schema with zod
const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

// Define form types
type FormValues = z.infer<typeof formSchema>;

export function MyFormModal() {
  const handleSubmit = async (data: FormValues) => {
    // Handle submission
    console.log(data);
  };

  return (
    <FormModal
      mode="create"
      entityLabels={{ singular: "User" }}
      schema={formSchema}
      defaultValues={{ name: "", email: "" }}
      onSubmit={handleSubmit}
      isSubmitting={false}
      renderForm={(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    >
      <Button>Add User</Button>
    </FormModal>
  );
}
```

### useFormMode

A utility hook for handling consistent text and behavior for create/edit forms.

**Usage:**

```tsx
import { useFormMode } from "@/app/components/forms";

function MyForm({ mode = "create" }) {
  const formMode = useFormMode({
    mode,
    entityLabels: { singular: "User" }
  });
  
  return (
    <div>
      <h1>{formMode.titleText}</h1>
      <p>{formMode.descriptionText}</p>
      
      {/* Form fields */}
      
      <Button>{formMode.actionText}</Button>
    </div>
  );
}
```

## Best Practices

1. **Use FormModal for Entity Forms**: For any CRUD operations on entities (creating or editing), use the FormModal component.

2. **Consistent Schema Validation**: Always use zod schemas for form validation to ensure consistent error messages.

3. **Controlled State Management**: For complex forms, consider controlling the form state externally (e.g., with React Query mutations).

4. **Responsive Sizing**: Use the appropriate size prop based on the form complexity.

5. **Error Handling**: Always handle form submission errors and display them to the user.

## Examples

For examples, see:
- `app/components/modals/UniversityModal.tsx` 