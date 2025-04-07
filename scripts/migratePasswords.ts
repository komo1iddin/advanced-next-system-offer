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
    
    // Find all users using the imported User model
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        // Check if the password is already in the new format
        if (user.password.includes(':')) {
          console.log(`User ${user.email} already has migrated password`);
          continue;
        }
        
        // Get a plain text version of the password for testing
        // This is for demonstration only - in a real scenario you'd need to:
        // 1. Either have users reset their passwords
        // 2. Or have a known plain text version for testing purposes
        const testPassword = 'Test123!'; // Replace with actual test password
        
        // Verify the original password with bcrypt (for testing)
        // This step is optional and only for validation
        const isValidPassword = await bcrypt.compare(testPassword, user.password);
        if (!isValidPassword) {
          console.log(`Could not validate test password for ${user.email} - skipping`);
          failCount++;
          continue;
        }
        
        // Create new password hash
        const newPasswordHash = await hashPassword(testPassword);
        
        // Update the user document with the new password hash
        user.password = newPasswordHash;
        await user.save();
        
        console.log(`Successfully migrated password for ${user.email}`);
        successCount++;
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