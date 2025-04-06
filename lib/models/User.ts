import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super-admin' | 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  avatar?: string;
  agentId?: mongoose.Schema.Types.ObjectId;
  universityDirectId?: mongoose.Schema.Types.ObjectId;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long']
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      required: true,
      enum: ['super-admin', 'admin', 'manager', 'user'],
      default: 'user',
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
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
    lastLogin: {
      type: Date
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Add compound indexes for common query patterns
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ email: 1, status: 1 });

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Add validation middleware
UserSchema.pre('save', function(this: IUser, next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Create and export the model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 