import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  category?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true
    },
    category: { 
      type: String, 
      trim: true
    },
    active: { 
      type: Boolean, 
      default: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  {
    timestamps: true,
    collection: 'tags'
  }
);

export default mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema); 