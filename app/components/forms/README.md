# Form and Modal Component System

This directory contains a standardized system for creating consistent forms and modals throughout the application.

## Overview

The system consists of:

1. **FormBase**: A reusable form component built on top of react-hook-form and zod validation
2. **ModalBase**: A standardized modal component with various configuration options
3. **FormModal**: A combination of FormBase and ModalBase for the common pattern of forms within modals
4. **useFormMode**: A utility hook for handling consistent text and behavior for create/edit forms
5. **Standardized Form Fields**: Reusable form field components for common input types
6. **Validation Library**: Reusable validation patterns and schemas using Zod

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

### Standardized Form Fields

Pre-built form field components that encapsulate common form field patterns:

#### FormTextField

A standardized text input field.

```tsx
import { FormTextField } from "@/app/components/forms";

// Inside your form render function:
<FormTextField
  name="name"
  label="Full Name"
  placeholder="Enter your full name"
  required
  disabled={isSubmitting}
  description="Your first and last name"
/>
```

#### FormSelectField

A standardized select dropdown input.

```tsx
import { FormSelectField } from "@/app/components/forms";

// Define options
const countryOptions = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
];

// Inside your form render function:
<FormSelectField
  name="country"
  label="Country"
  placeholder="Select your country"
  options={countryOptions}
  required
  disabled={isSubmitting}
/>
```

#### FormSwitchField

A standardized toggle switch input.

```tsx
import { FormSwitchField } from "@/app/components/forms";

// Inside your form render function:
<FormSwitchField
  name="active"
  label="Active Status"
  description="Toggle to enable or disable"
  disabled={isSubmitting}
/>
```

### Validation Library

A comprehensive library of reusable validation patterns using Zod for consistent form validation.

**Basic Usage:**

```tsx
import { validation } from "@/app/components/forms";
import { z } from "zod";

// Define schema using validation helpers
const userSchema = z.object({
  name: validation.requiredString("Name is required"),
  email: validation.email(),
  age: validation.numberWithRange(18, 120, "Must be at least 18 years old"),
  website: validation.url().optional(),
});

// Use with FormBase or FormModal
function UserForm() {
  return (
    <FormBase
      schema={userSchema}
      defaultValues={{ name: "", email: "", age: 30 }}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
    </FormBase>
  );
}
```

For more details about the validation library, see the [validation README](./validation/README.md).

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

2. **Use Standardized Form Fields**: Whenever possible, use the pre-built form field components for consistent styling and behavior.

3. **Use Validation Library**: Use the validation library for all form validations to ensure consistent error messages and validation rules.

4. **Consistent Schema Validation**: Always use zod schemas for form validation to ensure consistent error messages.

5. **Controlled State Management**: For complex forms, consider controlling the form state externally (e.g., with React Query mutations).

6. **Responsive Sizing**: Use the appropriate size prop based on the form complexity.

7. **Error Handling**: Always handle form submission errors and display them to the user.

8. **Field Organization**: Group related fields together and use consistent spacing between field groups.

## Simplified Usage with Standardized Fields and Validation

Using standardized form fields and validation library significantly reduces boilerplate:

```tsx
import { 
  FormBase, 
  FormTextField, 
  FormSelectField, 
  FormSwitchField,
  validation 
} from "@/app/components/forms";
import { z } from "zod";

// Define schema with validation library
const formSchema = z.object({
  name: validation.requiredString("Name is required"),
  email: validation.email("Invalid email format"),
  role: validation.requiredString("Role is required"),
  active: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

export function UserForm() {
  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "Regular User" },
    { value: "guest", label: "Guest" }
  ];

  const handleSubmit = async (data: FormValues) => {
    // Handle submission
    console.log(data);
  };

  return (
    <FormBase
      schema={formSchema}
      defaultValues={{ name: "", email: "", role: "", active: true }}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <div className="space-y-4">
          <FormTextField
            name="name"
            label="Name"
            required
            placeholder="Enter user name"
          />
          
          <FormTextField
            name="email"
            label="Email Address"
            required
            placeholder="Enter email address"
          />
          
          <FormSelectField
            name="role"
            label="User Role"
            required
            options={roleOptions}
            placeholder="Select a role"
          />
          
          <FormSwitchField
            name="active"
            label="Active Status"
            description="Enables user access to the system"
          />
        </div>
      )}
    </FormBase>
  );
}
```

## Examples

For examples, see:
- `app/components/modals/UniversityModal.tsx` - Form modal implementation
- `app/admin/locations/components/CityForm.tsx` - Using form field components
- `app/admin/locations/components/ProvinceForm.tsx` - Using form field components
- `app/admin/locations/components/LocationFormModal.tsx` - Using validation library 