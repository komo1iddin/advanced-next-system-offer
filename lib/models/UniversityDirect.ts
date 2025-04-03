import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversityDirect extends Document {
  universityName: string;
  departmentName?: string;
  contactPersonName?: string;
  position?: string;
  description?: string;
  wechat?: string;
  telephone?: string;
  email?: string;
  website?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UniversityDirectSchema: Schema = new Schema(
  {
    universityName: { type: String, required: true, trim: true },
    departmentName: { type: String, trim: true },
    contactPersonName: { type: String, trim: true },
    position: { type: String, trim: true },
    description: { type: String, trim: true },
    wechat: { type: String, trim: true },
    telephone: { type: String, trim: true },
    email: { type: String, trim: true },
    website: { type: String, trim: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'universityDirects'
  }
);

export default mongoose.models.UniversityDirect || mongoose.model<IUniversityDirect>('UniversityDirect', UniversityDirectSchema); 