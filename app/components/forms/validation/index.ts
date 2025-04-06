import { z } from "zod";

/**
 * Common validation patterns for forms using Zod
 * This library provides reusable validation schemas for common form fields
 */

// ===== Text Fields =====

/**
 * Required string validation with custom error message
 */
export const requiredString = (errorMessage: string = "This field is required") =>
  z.string().min(1, { message: errorMessage });

/**
 * Optional string validation
 */
export const optionalString = () => z.string().optional();

/**
 * String with minimum and maximum length
 */
export const stringWithLength = (
  min: number = 0, 
  max: number = 255, 
  minMessage?: string, 
  maxMessage?: string
) => 
  z.string()
    .min(min, { message: minMessage || `Must be at least ${min} characters` })
    .max(max, { message: maxMessage || `Cannot exceed ${max} characters` });

// ===== Email Validation =====

/**
 * Email validation
 */
export const email = (errorMessage: string = "Invalid email address") =>
  z.string().email({ message: errorMessage });

// ===== Numbers =====

/**
 * Required numeric validation
 */
export const requiredNumber = (errorMessage: string = "This field is required") =>
  z.number({ 
    required_error: errorMessage,
    invalid_type_error: "Must be a number"
  });

/**
 * Number with minimum and maximum values
 */
export const numberWithRange = (
  min: number,
  max: number,
  minMessage?: string,
  maxMessage?: string
) =>
  z.number()
    .min(min, { message: minMessage || `Must be at least ${min}` })
    .max(max, { message: maxMessage || `Cannot exceed ${max}` });

/**
 * Positive number validation
 */
export const positiveNumber = (errorMessage: string = "Must be a positive number") =>
  z.number().positive({ message: errorMessage });

// ===== Dates =====

/**
 * Required date validation
 */
export const requiredDate = (errorMessage: string = "Date is required") =>
  z.date({
    required_error: errorMessage,
    invalid_type_error: "Must be a valid date",
  });

/**
 * Date range validation
 */
export const dateRange = (
  min?: Date,
  max?: Date,
  minMessage?: string,
  maxMessage?: string
) => {
  let schema = z.date();
  
  if (min) {
    schema = schema.min(min, { message: minMessage || "Date is too early" });
  }
  
  if (max) {
    schema = schema.max(max, { message: maxMessage || "Date is too late" });
  }
  
  return schema;
};

/**
 * Future date validation
 */
export const futureDate = (
  errorMessage: string = "Date must be in the future",
  reference: Date = new Date()
) =>
  z.date().min(reference, { message: errorMessage });

// ===== Arrays =====

/**
 * Non-empty array validation
 */
export const nonEmptyArray = <T extends z.ZodTypeAny>(
  schema: T,
  errorMessage: string = "At least one item is required"
) =>
  z.array(schema).min(1, { message: errorMessage });

// ===== IDs and References =====

/**
 * MongoDB ID validation
 */
export const mongoId = (errorMessage: string = "Invalid ID format") =>
  z.string().min(1, { message: errorMessage });

// ===== Special Types =====

/**
 * URL validation
 */
export const url = (errorMessage: string = "Invalid URL format") =>
  z.string().url({ message: errorMessage });

/**
 * Phone number validation (simple pattern)
 */
export const phoneNumber = (errorMessage: string = "Invalid phone number format") =>
  z.string().regex(/^\+?[0-9\s\-()]+$/, { message: errorMessage });

// ===== Common Entity Schemas =====

/**
 * Base entity schema with ID
 */
export const baseEntitySchema = z.object({
  _id: mongoId(),
});

/**
 * Active status schema
 */
export const activeStatusSchema = z.object({
  active: z.boolean().default(true),
});

// ===== Location Schemas =====

/**
 * Province/State validation schema
 */
export const provinceSchema = z.object({
  name: requiredString("Province name is required"),
  active: z.boolean(),
});

/**
 * City validation schema
 */
export const citySchema = z.object({
  name: requiredString("City name is required"),
  provinceId: mongoId("Province is required"),
  active: z.boolean(),
});

// ===== User Schemas =====

/**
 * User name validation schema
 */
export const userNameSchema = z.object({
  firstName: requiredString("First name is required"),
  lastName: requiredString("Last name is required"),
});

/**
 * Password validation schema
 */
export const passwordSchema = z.object({
  password: stringWithLength(8, 100, "Password must be at least 8 characters"),
});

/**
 * Password with confirmation validation
 */
export const passwordWithConfirmationSchema = passwordSchema.extend({
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

// ===== Utility Functions =====

/**
 * Merge multiple schemas into one
 * @param schemas Array of Zod object schemas to merge
 */
export function mergeSchemas<
  T extends z.ZodRawShape,
  U extends z.ZodRawShape
>(
  schemas: z.ZodObject<T | U>[]
): z.ZodObject<T & U> {
  return schemas.reduce(
    (mergedSchema, schema) => mergedSchema.merge(schema),
    z.object({}) as z.ZodObject<any>
  ) as z.ZodObject<T & U>;
}

/**
 * Convert all fields in a schema to optional
 * @param schema Zod object schema
 */
export function makeOptional<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  const shape = Object.entries(schema.shape).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.optional(),
    }),
    {}
  );
  
  return z.object(shape) as z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }>;
}

/**
 * Pick specific fields from a schema
 * @param schema Zod object schema
 * @param keys Array of keys to pick
 */
export function pickFields<T extends z.ZodRawShape, K extends keyof T>(
  schema: z.ZodObject<T>,
  keys: K[]
): z.ZodObject<Pick<T, K>> {
  const shape = keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: schema.shape[key],
    }),
    {}
  );
  
  return z.object(shape) as z.ZodObject<Pick<T, K>>;
} 