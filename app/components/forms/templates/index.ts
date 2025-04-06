import { UniversityFormTemplate, UniversityFormValues } from './UniversityFormTemplate';
import { TagFormTemplate, TagFormValues } from './TagFormTemplate';
import { FormValuesFromSchema, FormTemplateProps, FormTemplateChildProps } from './types';

// Export the components directly
export { UniversityFormTemplate, TagFormTemplate };

// Export the types with the 'export type' syntax
export type { 
  FormValuesFromSchema,
  FormTemplateProps, 
  FormTemplateChildProps,
  UniversityFormValues,
  TagFormValues 
}; 