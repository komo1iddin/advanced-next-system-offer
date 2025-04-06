# Form Validation Library

This directory contains a standardized system for form validations using Zod, providing consistent validation patterns across the application.

## Overview

The validation library provides:

1. **Common Field Validators**: Reusable validators for strings, numbers, dates, etc.
2. **Entity-Specific Schemas**: Pre-defined schemas for common entities
3. **Utility Functions**: Helpers for merging, transforming, and manipulating schemas
4. **Consistent Error Messages**: Standardized error messages for a unified user experience

## Using the Validation Library

### Basic Usage

```tsx
import { validation } from "@/app/components/forms";
import { z } from "zod";

// Define a schema using the validation helpers
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

### Using Pre-defined Entity Schemas

```tsx
import { validation } from "@/app/components/forms";
import { z } from "zod";

// Use an existing schema directly
const { provinceSchema } = validation;

// Or extend an existing schema
const extendedProvinceSchema = provinceSchema.extend({
  code: validation.requiredString("Province code is required"),
  population: validation.positiveNumber(),
});
```

### Merging Schemas

```tsx
import { validation } from "@/app/components/forms";

// Merge multiple schemas
const userProfileSchema = validation.mergeSchemas([
  validation.userNameSchema,
  validation.activeStatusSchema,
  z.object({
    bio: validation.optionalString(),
    avatar: validation.url("Avatar URL must be valid"),
  }),
]);
```

### Making Fields Optional

```tsx
import { validation } from "@/app/components/forms";

// Convert all fields to optional (useful for patch/update forms)
const updateUserSchema = validation.makeOptional(validation.userNameSchema);
```

### Picking Specific Fields

```tsx
import { validation } from "@/app/components/forms";

// Pick specific fields from a schema
const nameOnlySchema = validation.pickFields(validation.userNameSchema, ["firstName"]);
```

## Available Validators

### Text Fields

- **requiredString**: Ensures a string is not empty
- **optionalString**: Allows an optional string
- **stringWithLength**: Validates string length with min/max constraints

### Email

- **email**: Validates email format

### Numbers

- **requiredNumber**: Ensures a number is provided
- **numberWithRange**: Validates a number within a range
- **positiveNumber**: Ensures a number is positive

### Dates

- **requiredDate**: Ensures a date is provided
- **dateRange**: Validates a date within a range
- **futureDate**: Ensures a date is in the future

### Arrays

- **nonEmptyArray**: Ensures an array has at least one item

### IDs and References

- **mongoId**: Validates a MongoDB ID string format

### Special Types

- **url**: Validates URL format
- **phoneNumber**: Validates phone number format

### Common Entity Schemas

- **baseEntitySchema**: Standard schema with ID
- **activeStatusSchema**: Schema for entities with active status
- **provinceSchema**: Schema for provinces/states
- **citySchema**: Schema for cities
- **userNameSchema**: Schema for user names
- **passwordSchema**: Schema for passwords
- **passwordWithConfirmationSchema**: Schema for password with confirmation

## Best Practices

1. **Use the Validation Library**: Always use these validation patterns instead of creating custom ones
2. **Consistent Error Messages**: Keep error messages consistent with existing patterns
3. **Entity-Specific Schemas**: Create and export entity-specific schemas for reuse
4. **Schema Extension**: Extend existing schemas rather than duplicating them
5. **Documentation**: Document any new validation patterns added to the library

## Examples

For examples of usage, see:
- `app/admin/locations/components/LocationFormModal.tsx` - Using entity schemas
- `app/admin/locations/components/ProvinceForm.tsx` - Using validation utilities
- `app/admin/locations/components/CityForm.tsx` - Using validation utilities 