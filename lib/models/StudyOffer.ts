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
    title: { type: String, required: true, trim: true },
    universityName: { type: String, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City'
    },
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province'
    },
    degreeLevel: { 
      type: String, 
      required: true,
      enum: ['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Language Course']
    },
    programs: { type: [String], required: true },
    tuitionFees: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
      period: { type: String, required: true, default: 'Year' }
    },
    scholarshipAvailable: { type: Boolean, default: false },
    scholarshipDetails: { type: String },
    applicationDeadline: { type: Date, required: true },
    languageRequirements: [{
      language: { type: String, required: true },
      minimumScore: { type: String },
      testName: { type: String }
    }],
    durationInYears: { type: Number, required: true },
    campusFacilities: { type: [String] },
    admissionRequirements: { type: [String], required: true },
    tags: { type: [String], required: true },
    color: { type: String, required: true },
    accentColor: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['University', 'College']
    },
    source: { 
      type: String, 
      required: true,
      enum: ['agent', 'university direct', 'public university offer'],
      default: 'university direct'
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    universityDirectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversityDirect'
    },
    images: { type: [String] },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'studyOffers'
  }
);

// Create and export the model
export default mongoose.models.StudyOffer || mongoose.model<IStudyOffer>('StudyOffer', StudyOfferSchema); 