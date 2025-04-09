import { z } from "zod";

// Common query parameters schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  search: z.string().optional(),
});

// Study offer specific query parameters
export const studyOfferQuerySchema = z.object({
  // Pagination
  ...paginationSchema.shape,
  
  // Sorting
  ...sortingSchema.shape,
  
  // Search
  ...searchSchema.shape,
  
  // Filters
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "EXPIRED"]).optional(),
  level: z.enum(["BACHELOR", "MASTER", "PHD"]).optional(),
  language: z.enum(["ENGLISH", "GERMAN", "FRENCH", "SPANISH", "ITALIAN"]).optional(),
  mode: z.enum(["ON_CAMPUS", "ONLINE", "HYBRID"]).optional(),
  
  // Location filters
  city: z.string().uuid().optional(),
  province: z.string().uuid().optional(),
  university: z.string().uuid().optional(),
  program: z.string().uuid().optional(),
  
  // Price range
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  
  // Duration range
  minDuration: z.coerce.number().min(1).optional(),
  maxDuration: z.coerce.number().min(1).optional(),
  
  // Date filters
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  applicationDeadline: z.coerce.date().optional(),
  
  // Additional features
  scholarshipAvailable: z.coerce.boolean().optional(),
  accommodationAvailable: z.coerce.boolean().optional(),
  visaSupport: z.coerce.boolean().optional(),
  
  // User specific
  userId: z.string().uuid().optional(),
  isFavorite: z.coerce.boolean().optional(),
});

// Type inference
export type StudyOfferQuery = z.infer<typeof studyOfferQuerySchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SortingQuery = z.infer<typeof sortingSchema>;
export type SearchQuery = z.infer<typeof searchSchema>; 