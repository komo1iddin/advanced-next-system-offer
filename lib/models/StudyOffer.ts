import mongoose, { Schema, Document } from 'mongoose';

// Define interface for the StudyOffer document
export interface IStudyOffer extends Document {
  uniqueId: string;
  title: string;
  universityName: string;
  description: string;
  location: string;
  cityId?: mongoose.Schema.Types.ObjectId;
  provinceId?: mongoose.Schema.Types.ObjectId;
  degreeLevel: string;
  programs: string[];
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  applicationDeadline: Date;
  languageRequirements: {
    language: string;
    minimumScore?: string;
    testName?: string;
  }[];
  durationInYears: number;
  campusFacilities: string[];
  admissionRequirements: string[];
  tags: string[];
  color: string;
  accentColor: string;
  category: string;
  source: string;
  agentId?: mongoose.Schema.Types.ObjectId;
  universityDirectId?: mongoose.Schema.Types.ObjectId;
  images?: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const StudyOfferSchema: Schema = new Schema(
  {
    uniqueId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    universityName: { type: String, trim: true, index: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      index: true
    },
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      index: true
    },
    degreeLevel: { 
      type: String, 
      required: true,
      enum: ['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Language Course'],
      index: true
    },
    programs: { type: [String], required: true },
    tuitionFees: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
      period: { type: String, required: true, default: 'Year' }
    },
    scholarshipAvailable: { type: Boolean, default: false, index: true },
    scholarshipDetails: { type: String },
    applicationDeadline: { type: Date, required: true, index: true },
    languageRequirements: [{
      language: { type: String, required: true },
      minimumScore: { type: String },
      testName: { type: String }
    }],
    durationInYears: { type: Number, required: true },
    campusFacilities: { type: [String] },
    admissionRequirements: { type: [String], required: true },
    tags: { type: [String], required: true, index: true },
    color: { type: String, required: true },
    accentColor: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['University', 'College'],
      index: true
    },
    source: { 
      type: String, 
      required: true,
      enum: ['agent', 'university direct', 'public university offer'],
      default: 'university direct',
      index: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      index: true
    },
    universityDirectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversityDirect',
      index: true
    },
    images: { type: [String] },
    featured: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'studyOffers'
  }
);

// Add compound indexes for common query patterns
StudyOfferSchema.index({ title: 'text', description: 'text', universityName: 'text' });
StudyOfferSchema.index({ degreeLevel: 1, category: 1 });
StudyOfferSchema.index({ featured: 1, createdAt: -1 });
StudyOfferSchema.index({ applicationDeadline: 1, createdAt: -1 });

// Add validation middleware
StudyOfferSchema.pre('save', function(next) {
  if (this.isModified('applicationDeadline')) {
    if (this.applicationDeadline < new Date()) {
      next(new Error('Application deadline cannot be in the past'));
    }
  }
  next();
});

// Create and export the model
export default mongoose.models.StudyOffer || mongoose.model<IStudyOffer>('StudyOffer', StudyOfferSchema); 