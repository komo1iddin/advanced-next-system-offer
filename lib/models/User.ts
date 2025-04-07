import mongoose, { Schema, Document } from 'mongoose';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Promisify the scrypt function
const scryptAsync = promisify(scrypt);

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
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
    name: {
      type: String,
      trim: true
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
      index: true
    },
    lastName: {
      type: String,
      required: false,
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
    // Generate a random salt
    const salt = randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    const derivedKey = await scryptAsync(this.password, salt, 64) as Buffer;
    
    // Store the salt and hashed password together
    this.password = `${salt}:${derivedKey.toString('hex')}`;
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Split the stored password into salt and hash
    const [salt, storedHash] = this.password.split(':');
    
    // Hash the candidate password with the same salt
    const derivedKey = await scryptAsync(candidatePassword, salt, 64) as Buffer;
    
    // Compare the hashed candidate password with the stored hash
    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    
    // Use timingSafeEqual to prevent timing attacks
    return timingSafeEqual(derivedKey, storedHashBuffer);
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