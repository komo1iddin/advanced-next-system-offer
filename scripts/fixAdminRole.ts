import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './loadModels'; // Load all models first
import User from '../lib/models/User';

// Load environment variables
dotenv.config();

// Target email (your email)
const TARGET_EMAIL = 'komo1iddin.pro@gmail.com';

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
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

// Fix admin role
async function fixAdminRole() {
  try {
    // Connect to the database
    const connected = await connectToDatabase();
    if (!connected) return;
    
    // Find the user
    const user = await User.findOne({ email: TARGET_EMAIL });
    
    if (!user) {
      console.log(`User with email ${TARGET_EMAIL} not found`);
      return;
    }
    
    console.log('Current user state:');
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Status: ${user.status}`);
    
    // Ensure role is exactly 'admin' (case sensitive)
    if (user.role !== 'admin') {
      console.log(`Updating role from '${user.role}' to 'admin'`);
      user.role = 'admin';
      await user.save();
      console.log('Role updated successfully');
    } else {
      console.log('Role is already set to "admin"');
    }
    
    // Make sure active status is set
    if (user.status !== 'active') {
      console.log(`Updating status from '${user.status}' to 'active'`);
      user.status = 'active';
      await user.save();
      console.log('Status updated successfully');
    } else {
      console.log('Status is already set to "active"');
    }
    
    // Verify user after changes
    const updatedUser = await User.findOne({ email: TARGET_EMAIL });
    console.log('\nUpdated user state:');
    console.log(`- Email: ${updatedUser.email}`);
    console.log(`- Role: ${updatedUser.role}`);
    console.log(`- Status: ${updatedUser.status}`);
    
    // Clean the JWT cookie to ensure a fresh login
    console.log('\nIMPORTANT: Now please:');
    console.log('1. Clear your browser cookies for this site');
    console.log('2. Clear browser cache and storage');
    console.log('3. Close and reopen your browser');
    console.log('4. Sign in again with your credentials');
    
  } catch (error) {
    console.error('Error fixing admin role:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\nClosed database connection');
  }
}

// Run the fix
fixAdminRole()
  .then(() => console.log('Admin role fix completed'))
  .catch(error => console.error('Error during admin role fix:', error)); 