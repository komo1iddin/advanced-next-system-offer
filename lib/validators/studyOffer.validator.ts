import { z } from 'zod';

export const createStudyOfferSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  universityName: z.string().min(1, 'University name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  cityId: z.string().optional(),
  provinceId: z.string().optional(),
  degreeLevel: z.enum(['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Language Course']),
  programs: z.array(z.string()).min(1, 'At least one program is required'),
  tuitionFees: z.object({
    amount: z.number().min(0, 'Amount must be positive'),
    currency: z.string().default('USD'),
    period: z.string().default('Year')
  }),
  scholarshipAvailable: z.boolean().default(false),
  scholarshipDetails: z.string().optional(),
  applicationDeadline: z.string().transform(str => new Date(str)),
  languageRequirements: z.array(z.object({
    language: z.string(),
    minimumScore: z.string().optional(),
    testName: z.string().optional()
  })),
  durationInYears: z.number().min(0.5, 'Duration must be at least 0.5 years'),
  campusFacilities: z.array(z.string()).optional(),
  admissionRequirements: z.array(z.string()).min(1, 'At least one admission requirement is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  color: z.string().min(1, 'Color is required'),
  accentColor: z.string().min(1, 'Accent color is required'),
  category: z.enum(['University', 'College']),
  source: z.enum(['agent', 'university direct', 'public university offer']).default('university direct'),
  agentId: z.string().optional(),
  universityDirectId: z.string().optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().default(false)
});

export const updateStudyOfferSchema = createStudyOfferSchema.partial();

export const getStudyOffersSchema = z.object({
  category: z.string().optional(),
  degreeLevel: z.string().optional(),
  search: z.string().optional(),
  uniqueId: z.string().optional(),
  featured: z.string().optional(),
  limit: z.string().optional().transform(str => parseInt(str, 10)),
  page: z.string().optional().transform(str => parseInt(str, 10))
}); 