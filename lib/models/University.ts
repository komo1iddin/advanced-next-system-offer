import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  localRanking: number | null;
  worldRanking: number | null;
  locationId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    localRanking: { type: Number, default: null },
    worldRanking: { type: Number, default: null },
    locationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'City',
      required: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'universities'
  }
);

export default mongoose.models.University || mongoose.model<IUniversity>('University', UniversitySchema); 