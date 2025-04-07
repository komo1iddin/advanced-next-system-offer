import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import './loadModels'; // Load all models first
import User from '../lib/models/User'; // Now import specific models

// Load environment variables
dotenv.config();

// Promisify the scrypt function
const scryptAsync = promisify(scrypt);

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the environment variables');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Hash password with crypto
async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex');
  
  // Hash the password with the salt
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  
  // Store the salt and hashed password together
  return `${salt}:${derivedKey.toString('hex')}`;
}

// Migrate passwords
async function migratePasswords() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Debug: Check what collections exist in the database
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections in database:', collections.map(c => c.name));
    } else {
      console.log('Database connection not fully established');
    }
    
    // Find all users using the imported User model
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        // Log user details for debugging
        console.log(`Processing user: ${user.email}, ID: ${user._id}`);
        
        // Check if the password is already in the new format
        if (user.password && user.password.includes(':')) {
          console.log(`User ${user.email} already has migrated password`);
          continue;
        }
        
        console.log('Current password format:', typeof user.password, 'length:', user.password?.length || 0);
        
        // Generate new crypto format password
        console.log(`Generating new crypto format password for ${user.email}`);
        
        // Create new password hash with a temporary value
        const newPasswordHash = await hashPassword('TemporaryPassword123!');
        
        // Use direct MongoDB update to bypass Mongoose validation
        // This avoids the firstName/lastName validation issue
        if (mongoose.connection.db) {
          const result = await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: newPasswordHash } }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`Successfully migrated password for ${user.email}`);
            successCount++;
          } else {
            console.log(`No changes made to ${user.email}`);
            failCount++;
          }
        } else {
          throw new Error('Database connection not established');
        }
      } catch (error) {
        console.error(`Failed to migrate password for ${user.email}:`, error);
        failCount++;
      }
    }
    
    console.log('\nMigration Summary:');
    console.log(`Total users: ${users.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed to migrate: ${failCount}`);
    console.log(`Already migrated: ${users.length - successCount - failCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Closed database connection');
  }
}

// Run the migration
migratePasswords()
  .then(() => console.log('Password migration completed'))
  .catch(error => console.error('Error during migration:', error)); 