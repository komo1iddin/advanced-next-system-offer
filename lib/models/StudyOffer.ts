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
      index: true,
      validate: {
        validator: async function(value: mongoose.Schema.Types.ObjectId) {
          if (!value) return true;
          const City = mongoose.model('City');
          const city = await City.findById(value);
          return !!city;
        },
        message: 'Invalid city ID'
      }
    },
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      index: true,
      validate: {
        validator: async function(value: mongoose.Schema.Types.ObjectId) {
          if (!value) return true;
          const Province = mongoose.model('Province');
          const province = await Province.findById(value);
          return !!province;
        },
        message: 'Invalid province ID'
      }
    },
    degreeLevel: { 
      type: String, 
      required: true,
      enum: ['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Language Course'],
      index: true
    },
    programs: { 
      type: [String], 
      required: true,
      validate: {
        validator: function(value: string[]) {
          return value.length > 0;
        },
        message: 'At least one program is required'
      }
    },
    tuitionFees: {
      amount: { 
        type: Number, 
        required: true,
        min: [0, 'Amount must be positive']
      },
      currency: { 
        type: String, 
        required: true, 
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
      },
      period: { 
        type: String, 
        required: true, 
        default: 'Year',
        enum: ['Year', 'Semester', 'Month']
      }
    },
    scholarshipAvailable: { type: Boolean, default: false, index: true },
    scholarshipDetails: { 
      type: String,
      validate: {
        validator: function(value: string) {
          if (!this.scholarshipAvailable) return true;
          return value && value.length > 0;
        },
        message: 'Scholarship details are required when scholarship is available'
      }
    },
    applicationDeadline: { 
      type: Date, 
      required: true, 
      index: true,
      validate: {
        validator: function(value: Date) {
          return value > new Date();
        },
        message: 'Application deadline must be in the future'
      }
    },
    languageRequirements: [{
      language: { 
        type: String, 
        required: true,
        enum: ['English', 'French', 'German', 'Spanish', 'Italian', 'Chinese', 'Japanese', 'Korean']
      },
      minimumScore: { 
        type: String,
        validate: {
          validator: function(value: string) {
            if (!value) return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(value);
          },
          message: 'Invalid score format'
        }
      },
      testName: { 
        type: String,
        enum: ['IELTS', 'TOEFL', 'TOEIC', 'DELF', 'DALF', 'TestDaF', 'DELE', 'HSK', 'JLPT', 'TOPIK']
      }
    }],
    durationInYears: { 
      type: Number, 
      required: true,
      min: [0.5, 'Duration must be at least 0.5 years']
    },
    campusFacilities: { 
      type: [String],
      validate: {
        validator: function(value: string[]) {
          return value.every(facility => facility.length > 0);
        },
        message: 'Invalid facility name'
      }
    },
    admissionRequirements: { 
      type: [String], 
      required: true,
      validate: {
        validator: function(value: string[]) {
          return value.length > 0;
        },
        message: 'At least one admission requirement is required'
      }
    },
    tags: { 
      type: [String], 
      required: true,
      index: true,
      validate: {
        validator: function(value: string[]) {
          return value.length > 0;
        },
        message: 'At least one tag is required'
      }
    },
    color: { 
      type: String, 
      required: true,
      validate: {
        validator: function(value: string) {
          return /^#[0-9A-Fa-f]{6}$/.test(value);
        },
        message: 'Invalid color format'
      }
    },
    accentColor: { 
      type: String, 
      required: true,
      validate: {
        validator: function(value: string) {
          return /^#[0-9A-Fa-f]{6}$/.test(value);
        },
        message: 'Invalid accent color format'
      }
    },
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
      index: true,
      validate: {
        validator: async function(value: mongoose.Schema.Types.ObjectId) {
          if (!value) return true;
          const Agent = mongoose.model('Agent');
          const agent = await Agent.findById(value);
          return !!agent;
        },
        message: 'Invalid agent ID'
      }
    },
    universityDirectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversityDirect',
      index: true,
      validate: {
        validator: async function(value: mongoose.Schema.Types.ObjectId) {
          if (!value) return true;
          const UniversityDirect = mongoose.model('UniversityDirect');
          const universityDirect = await UniversityDirect.findById(value);
          return !!universityDirect;
        },
        message: 'Invalid university direct ID'
      }
    },
    images: { 
      type: [String],
      validate: {
        validator: function(value: string[]) {
          return value.every(url => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          });
        },
        message: 'Invalid image URL'
      }
    },
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
StudyOfferSchema.index({ title: 'text', description: 'text', universityName: 'text' }, { 
  weights: { 
    title: 10, 
    universityName: 5, 
    description: 1
  },
  name: 'text_search_idx'
});

// Optimize for filtering queries
StudyOfferSchema.index({ degreeLevel: 1, category: 1 }, { name: 'degree_category_idx' });
StudyOfferSchema.index({ degreeLevel: 1, scholarshipAvailable: 1 }, { name: 'degree_scholarship_idx' });
StudyOfferSchema.index({ applicationDeadline: 1, createdAt: -1 }, { name: 'deadline_created_idx' });
StudyOfferSchema.index({ featured: 1, createdAt: -1 }, { name: 'featured_created_idx' });
StudyOfferSchema.index({ 'tuitionFees.amount': 1 }, { name: 'tuition_amount_idx' });
StudyOfferSchema.index({ durationInYears: 1 }, { name: 'duration_idx' });
StudyOfferSchema.index({ tags: 1, createdAt: -1 }, { name: 'tags_created_idx' });
StudyOfferSchema.index({ location: 1, degreeLevel: 1 }, { name: 'location_degree_idx' });

// Add validation middleware
StudyOfferSchema.pre('save', function(next) {
  if (this.isModified('applicationDeadline')) {
    if (this.applicationDeadline < new Date()) {
      next(new Error('Application deadline cannot be in the past'));
    }
  }
  next();
});

// Add cascade delete middleware
StudyOfferSchema.pre('remove', async function(next) {
  // Add any cascade delete operations here
  next();
});

// Create and export the model
export default mongoose.models.StudyOffer || mongoose.model<IStudyOffer>('StudyOffer', StudyOfferSchema); 