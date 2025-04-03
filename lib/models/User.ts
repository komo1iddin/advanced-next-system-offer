import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true
  }
);

// Remove redundant index - email already has unique: true which creates an index
// UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 