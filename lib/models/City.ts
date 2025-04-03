import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  provinceId: mongoose.Schema.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    provinceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Province',
      required: true 
    },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'cities'
  }
);

// Create a compound index for unique city names per province
CitySchema.index({ name: 1, provinceId: 1 }, { unique: true });

export default mongoose.models.City || mongoose.model<ICity>('City', CitySchema); 