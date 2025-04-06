import { FieldValues, UseFormReturn } from "react-hook-form";
import { z } from "zod";

/**
 * Form mode to determine if the form is for creating or editing an entity
 */
export type FormMode = "create" | "edit";

/**
 * Base props that all form templates should accept
 */
export interface BaseFormTemplateProps {
  /**
   * The mode of the form (create or edit)
   */
  mode?: FormMode;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;

  /**
   * Optional className to apply to the form template root
   */
  className?: string;
}

/**
 * Props for form templates when used independently
 */
export interface FormTemplateProps<TValues extends FieldValues> extends BaseFormTemplateProps {
  /**
   * Initial data for the form
   */
  initialData?: Partial<TValues>;

  /**
   * Function called when the form is submitted
   */
  onSubmit?: (values: TValues) => void | Promise<void>;

  /**
   * Optional form instance if the template is used within FormBase render prop pattern
   */
  form?: UseFormReturn<TValues>;
}

/**
 * Props for form templates when used within FormBase or FormModal
 */
export interface FormTemplateChildProps<TValues extends FieldValues> extends BaseFormTemplateProps {
  /**
   * Form instance from the parent FormBase component
   */
  form: UseFormReturn<TValues>;
}

/**
 * Helper type to extract the values type from a Zod schema
 */
export type FormValuesFromSchema<T extends z.ZodType> = z.infer<T>; 