// Export base components
export { FormBase } from './FormBase';
export { FormModal } from './FormModal';
export { useFormMode } from './useFormMode';

// Export standardized field components
export { default as FormTextField } from './fields/FormTextField';
export { default as FormSelectField } from './fields/FormSelectField';
export { default as FormSwitchField } from './fields/FormSwitchField';
export { default as FormDateField } from './fields/FormDateField';
export { default as FormTextareaField } from './fields/FormTextareaField';
export { default as FormFileField } from './fields/FormFileField';

// Export layout components
export { 
  FormSection, 
  FormRow, 
  FormSpacer, 
  FormCard, 
  FormDivider, 
  FormHelperText 
} from './layout';

// Export validation patterns
export * as validation from './validation';

// Export form templates
export * from './templates';

// This allows importing like:
// import { FormBase, FormModal, useFormMode, FormRow, TagFormTemplate } from '@/app/components/forms'; 