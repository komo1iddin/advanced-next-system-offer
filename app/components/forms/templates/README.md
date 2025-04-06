# Form Templates

This directory contains reusable form templates for common entity types in the application. These templates build on the form system components and validation schemas to provide consistent form implementations for entities like universities, agents, locations, etc.

## Purpose

Form templates serve several important purposes:

1. **Consistency** - Ensure all forms for a given entity type follow the same structure and validation rules
2. **Maintainability** - Centralize form implementation for each entity type, making updates easier
3. **Reusability** - Allow the same form to be used in different contexts (modals, pages, etc.)
4. **Standardization** - Enforce consistent UX patterns across the application

## Using Templates

Each template follows a consistent pattern:

```tsx
import { FormTemplateProps } from './types';

export function UniversityFormTemplate({
  initialData,
  onSubmit,
  isSubmitting,
  mode,
  ...props
}: FormTemplateProps<UniversityFormValues>) {
  // Form implementation using FormBase, FormSection, FormRow, etc.
  return (
    <>
      {/* Form content here */}
    </>
  );
}
```

Templates can be used in different contexts:

### In a Modal

```tsx
<FormModal
  mode={mode}
  schema={universitySchema}
  defaultValues={initialData}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  renderForm={() => <UniversityFormTemplate mode={mode} />}
>
  {triggerButton}
</FormModal>
```

### In a Page

```tsx
<AdminFormPage
  title="Add University"
  schema={universitySchema}
  defaultValues={initialData}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  returnUrl="/admin/universities"
>
  <UniversityFormTemplate mode="create" />
</AdminFormPage>
```

### In a Custom Layout

```tsx
<FormBase
  schema={universitySchema}
  defaultValues={initialData}
  onSubmit={handleSubmit}
>
  {(form) => (
    <div className="custom-layout">
      <UniversityFormTemplate 
        form={form} 
        mode="edit" 
        isSubmitting={isSubmitting}
      />
      <div className="custom-footer">
        <Button type="submit">Submit</Button>
      </div>
    </div>
  )}
</FormBase>
```

## Available Templates

- `UniversityFormTemplate` - For university creation and editing
- `AgentFormTemplate` - For agent creation and editing
- `LocationFormTemplate` - For locations (cities, provinces) creation and editing
- `OfferFormTemplate` - For study offer creation and editing
- `TagFormTemplate` - For tag and category creation and editing
- `UserFormTemplate` - For user creation and editing 