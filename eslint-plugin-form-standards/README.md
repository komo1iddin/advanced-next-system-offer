# eslint-plugin-form-standards

ESLint plugin to enforce the use of standardized form components and validation patterns.

## Installation

```bash
npm install --save-dev eslint-plugin-form-standards
```

## Usage

Add `form-standards` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["form-standards"]
}
```

Then configure the rules you want to use:

```json
{
  "rules": {
    "form-standards/use-form-base": "warn",
    "form-standards/use-validation-library": "warn",
    "form-standards/use-form-field-components": "warn"
  }
}
```

Or use the recommended configuration:

```json
{
  "extends": ["plugin:form-standards/recommended"]
}
```

## Rules

### `use-form-base`

This rule enforces the use of `FormBase` from `@/app/components/forms` instead of raw HTML form elements or direct use of react-hook-form.

Examples of **incorrect** code:

```jsx
import { useForm } from "react-hook-form";

function MyForm() {
  const form = useForm();
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form contents */}
    </form>
  );
}
```

Examples of **correct** code:

```jsx
import { FormBase } from "@/app/components/forms";
import { z } from "zod";

function MyForm() {
  return (
    <FormBase
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      {/* form contents */}
    </FormBase>
  );
}
```

### `use-validation-library`

This rule enforces the use of the validation library from `@/app/components/forms` instead of direct Zod methods.

Examples of **incorrect** code:

```jsx
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be at least 18 years old")
});
```

Examples of **correct** code:

```jsx
import { z } from "zod";
import { validation } from "@/app/components/forms";

const formSchema = z.object({
  name: validation.requiredString("Name is required"),
  email: validation.email("Invalid email"),
  age: validation.numberWithRange(18, 120, "Must be at least 18 years old")
});
```

### `use-form-field-components`

This rule encourages the use of standardized form field components instead of raw FormField components.

Examples of **incorrect** code:

```jsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

Examples of **correct** code:

```jsx
<FormTextField
  name="name"
  label="Name"
  placeholder="Enter your name"
  required
/>
```

## When to Use

- When implementing forms using react-hook-form and zod
- When working with forms in a Next.js or React application
- When you want to ensure consistent form implementation across your codebase

## License

MIT 