import { z } from "zod";

// Basic validation schemas for common fields
const idSchema = z.string().optional();
const titleSchema = z.string().min(1, "Title is required").max(500);
const descriptionSchema = z.string().min(1, "Description is required").max(10000);
const universityNameSchema = z.string().min(1, "University name is required").max(200);
const locationSchema = z.string().min(1, "Location is required").max(200);
const durationInYearsSchema = z.union([
  z.number().min(0.1, "Duration must be positive"),
  z.string().transform((val) => parseFloat(val) || 0)
]);
const applicationDeadlineSchema = z
  .union([
    z.date(),
    z.string().transform((val) => {
      try {
        return new Date(val);
      } catch {
        return new Date();
      }
    })
  ]);
const degreeLevelSchema = z.enum(['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Language Course']);
const programsSchema = z.array(z.string()).min(1, "At least one program is required");
const languageRequirementsSchema = z.array(
  z.object({
    language: z.string(),
    minimumScore: z.string().optional(),
    testName: z.string().optional()
  })
);
const admissionRequirementsSchema = z.array(z.string()).min(1, "At least one admission requirement is required");
const campusFacilitiesSchema = z.array(z.string()).optional();
const tagsSchema = z.array(z.string()).min(1, "At least one tag is required");
const colorSchema = z.string().min(1, "Color is required");
const accentColorSchema = z.string().min(1, "Accent color is required");
const categorySchema = z.enum(['University', 'College']);
const sourceSchema = z.enum(['agent', 'university direct', 'public university offer']).default('university direct');
const tuitionFeesSchema = z.object({
  amount: z.union([
    z.number().min(0, "Amount must be positive"),
    z.string().transform((val) => parseFloat(val) || 0)
  ]),
  currency: z.string().default('USD'),
  period: z.string().default('Year')
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
const uniqueIdSchema = z.string().optional();

// Main study offer schema
export const studyOfferSchema = z.object({
  id: idSchema,
  uniqueId: uniqueIdSchema,
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
}).passthrough(); // Allow additional fields

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
  degreeLevel: z.string().optional(),
  category: z.string().optional(), 
  city: z.string().optional(),
  province: z.string().optional(),
  featured: z.boolean().optional(),
  scholarshipAvailable: z.boolean().optional(),
  minTuition: z.number().optional(),
  maxTuition: z.number().optional(),
  minDuration: z.number().optional(),
  maxDuration: z.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  uniqueId: z.string().optional(),
}).passthrough(); // Allow additional fields

// Legacy support for API routes
export const getStudyOffersSchema = z.object({
  category: z.string().optional(),
  degreeLevel: z.string().optional(),
  search: z.string().optional(),
  uniqueId: z.string().optional(),
  featured: z.string().optional().transform(str => str === 'true' ? true : str === 'false' ? false : undefined),
  limit: z.string().optional().transform(str => str ? parseInt(str, 10) : undefined),
  page: z.string().optional().transform(str => str ? parseInt(str, 10) : undefined)
});

// Type inference
export type StudyOffer = z.infer<typeof studyOfferSchema>;
export type CreateStudyOffer = z.infer<typeof createStudyOfferSchema>;
export type UpdateStudyOffer = z.infer<typeof updateStudyOfferSchema>;
export type StudyOfferFilter = z.infer<typeof studyOfferFilterSchema>; 