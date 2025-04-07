import { z } from "zod";

// Basic validation schemas for common fields
const idSchema = z.string().optional();
const titleSchema = z.string().min(1, "Title is required").max(100);
const descriptionSchema = z.string().min(10, "Description must be at least 10 characters").max(5000);
const universityNameSchema = z.string().min(1, "University name is required").max(100);
const locationSchema = z.string().min(1, "Location is required").max(100);
const durationInYearsSchema = z.number().min(0.5, "Duration must be at least 0.5 years");
const applicationDeadlineSchema = z.date().or(z.string().transform(val => new Date(val)));
const degreeLevelSchema = z.enum(['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Language Course']);
const programsSchema = z.array(z.string()).min(1, "At least one program is required");
const languageRequirementsSchema = z.array(
  z.object({
    language: z.string(),
    minimumScore: z.string().optional(),
    testName: z.string().optional()
  })
).min(1, "At least one language requirement is required");
const admissionRequirementsSchema = z.array(z.string()).min(1, "At least one admission requirement is required");
const campusFacilitiesSchema = z.array(z.string()).optional();
const tagsSchema = z.array(z.string()).min(1, "At least one tag is required");
const colorSchema = z.string().min(1, "Color is required");
const accentColorSchema = z.string().min(1, "Accent color is required");
const categorySchema = z.enum(['University', 'College']);
const sourceSchema = z.enum(['agent', 'university direct', 'public university offer']).default('university direct');
const tuitionFeesSchema = z.object({
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string(),
  period: z.string()
});
const scholarshipAvailableSchema = z.boolean().default(false);
const scholarshipDetailsSchema = z.string().optional();
const featuredSchema = z.boolean().default(false);
const cityIdSchema = z.string().optional();
const provinceIdSchema = z.string().optional();
const agentIdSchema = z.string().optional();
const universityDirectIdSchema = z.string().optional();
const imagesSchema = z.array(z.string()).optional();
const createdAtSchema = z.date().optional();
const updatedAtSchema = z.date().optional();
const createdBySchema = z.string().optional();
const updatedBySchema = z.string().optional();

// Main study offer schema
export const studyOfferSchema = z.object({
  id: idSchema,
  title: titleSchema,
  universityName: universityNameSchema,
  description: descriptionSchema,
  location: locationSchema,
  cityId: cityIdSchema,
  provinceId: provinceIdSchema,
  degreeLevel: degreeLevelSchema,
  programs: programsSchema,
  tuitionFees: tuitionFeesSchema,
  scholarshipAvailable: scholarshipAvailableSchema,
  scholarshipDetails: scholarshipDetailsSchema,
  applicationDeadline: applicationDeadlineSchema,
  languageRequirements: languageRequirementsSchema,
  durationInYears: durationInYearsSchema,
  campusFacilities: campusFacilitiesSchema,
  admissionRequirements: admissionRequirementsSchema,
  tags: tagsSchema,
  color: colorSchema,
  accentColor: accentColorSchema,
  category: categorySchema,
  source: sourceSchema,
  agentId: agentIdSchema,
  universityDirectId: universityDirectIdSchema,
  images: imagesSchema,
  featured: featuredSchema,
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
  createdBy: createdBySchema,
  updatedBy: updatedBySchema,
});

// Schema for creating a new study offer
export const createStudyOfferSchema = studyOfferSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

// Schema for updating an existing study offer
export const updateStudyOfferSchema = createStudyOfferSchema.partial();

// Schema for filtering study offers
export const studyOfferFilterSchema = z.object({
  search: z.string().optional(),
  degreeLevel: degreeLevelSchema.optional(),
  category: categorySchema.optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  featured: z.boolean().optional(),
  scholarshipAvailable: z.boolean().optional(),
  minTuition: z.number().optional(),
  maxTuition: z.number().optional(),
  minDuration: z.number().optional(),
  maxDuration: z.number().optional(),
  sortBy: z.enum([
    "title",
    "durationInYears",
    "applicationDeadline",
    "createdAt",
    "updatedAt",
  ]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Type inference
export type StudyOffer = z.infer<typeof studyOfferSchema>;
export type CreateStudyOffer = z.infer<typeof createStudyOfferSchema>;
export type UpdateStudyOffer = z.infer<typeof updateStudyOfferSchema>;
export type StudyOfferFilter = z.infer<typeof studyOfferFilterSchema>; 