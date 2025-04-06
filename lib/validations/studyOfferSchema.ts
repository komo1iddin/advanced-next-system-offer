import { z } from "zod";

// Basic validation schemas for common fields
const idSchema = z.string().uuid().optional();
const nameSchema = z.string().min(1, "Name is required").max(100);
const descriptionSchema = z.string().min(10, "Description must be at least 10 characters").max(1000);
const priceSchema = z.number().min(0, "Price must be a positive number");
const durationSchema = z.number().min(1, "Duration must be at least 1 month").max(48, "Duration cannot exceed 48 months");
const startDateSchema = z.date().min(new Date(), "Start date must be in the future");
const endDateSchema = z.date().min(new Date(), "End date must be in the future");
const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "EXPIRED"]);
const levelSchema = z.enum(["BACHELOR", "MASTER", "PHD"]);
const languageSchema = z.enum(["ENGLISH", "GERMAN", "FRENCH", "SPANISH", "ITALIAN"]);
const modeSchema = z.enum(["ON_CAMPUS", "ONLINE", "HYBRID"]);
const citySchema = z.string().uuid();
const provinceSchema = z.string().uuid();
const universitySchema = z.string().uuid();
const programSchema = z.string().uuid();
const requirementsSchema = z.array(z.string()).min(1, "At least one requirement is required");
const benefitsSchema = z.array(z.string()).min(1, "At least one benefit is required");
const tagsSchema = z.array(z.string()).optional();
const imagesSchema = z.array(z.string().url()).optional();
const documentsSchema = z.array(z.string().url()).optional();
const contactEmailSchema = z.string().email("Invalid email address");
const contactPhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number");
const websiteSchema = z.string().url("Invalid URL").optional();
const applicationDeadlineSchema = z.date().min(new Date(), "Application deadline must be in the future");
const maxStudentsSchema = z.number().min(1, "Maximum students must be at least 1").optional();
const minGpaSchema = z.number().min(0, "Minimum GPA must be a positive number").max(4, "Maximum GPA is 4").optional();
const tuitionFeeSchema = z.number().min(0, "Tuition fee must be a positive number");
const applicationFeeSchema = z.number().min(0, "Application fee must be a positive number").optional();
const scholarshipAvailableSchema = z.boolean().default(false);
const scholarshipDetailsSchema = z.string().optional();
const accommodationAvailableSchema = z.boolean().default(false);
const accommodationDetailsSchema = z.string().optional();
const visaSupportSchema = z.boolean().default(false);
const visaDetailsSchema = z.string().optional();
const createdAtSchema = z.date().optional();
const updatedAtSchema = z.date().optional();
const createdBySchema = z.string().uuid().optional();
const updatedBySchema = z.string().uuid().optional();

// Main study offer schema
export const studyOfferSchema = z.object({
  id: idSchema,
  name: nameSchema,
  description: descriptionSchema,
  price: priceSchema,
  duration: durationSchema,
  startDate: startDateSchema,
  endDate: endDateSchema,
  status: statusSchema,
  level: levelSchema,
  language: languageSchema,
  mode: modeSchema,
  city: citySchema,
  province: provinceSchema,
  university: universitySchema,
  program: programSchema,
  requirements: requirementsSchema,
  benefits: benefitsSchema,
  tags: tagsSchema,
  images: imagesSchema,
  documents: documentsSchema,
  contactEmail: contactEmailSchema,
  contactPhone: contactPhoneSchema,
  website: websiteSchema,
  applicationDeadline: applicationDeadlineSchema,
  maxStudents: maxStudentsSchema,
  minGpa: minGpaSchema,
  tuitionFee: tuitionFeeSchema,
  applicationFee: applicationFeeSchema,
  scholarshipAvailable: scholarshipAvailableSchema,
  scholarshipDetails: scholarshipDetailsSchema,
  accommodationAvailable: accommodationAvailableSchema,
  accommodationDetails: accommodationDetailsSchema,
  visaSupport: visaSupportSchema,
  visaDetails: visaDetailsSchema,
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
  status: statusSchema.optional(),
  level: levelSchema.optional(),
  language: languageSchema.optional(),
  mode: modeSchema.optional(),
  city: citySchema.optional(),
  province: provinceSchema.optional(),
  university: universitySchema.optional(),
  program: programSchema.optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  minDuration: durationSchema.optional(),
  maxDuration: durationSchema.optional(),
  scholarshipAvailable: z.boolean().optional(),
  accommodationAvailable: z.boolean().optional(),
  visaSupport: z.boolean().optional(),
  startDate: startDateSchema.optional(),
  endDate: endDateSchema.optional(),
  applicationDeadline: applicationDeadlineSchema.optional(),
  sortBy: z.enum([
    "name",
    "price",
    "duration",
    "startDate",
    "endDate",
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