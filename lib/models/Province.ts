import mongoose, { Schema, Document } from 'mongoose';

export interface IProvince extends Document {
  name: string;
  country: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProvinceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'provinces'
  }
);

// Create a compound index for unique province names per country
ProvinceSchema.index({ name: 1, country: 1 }, { unique: true });

export default mongoose.models.Province || mongoose.model<IProvince>('Province', ProvinceSchema); 