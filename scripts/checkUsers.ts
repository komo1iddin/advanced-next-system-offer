import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './loadModels'; // Load all models first
import User from '../lib/models/User';

// Load environment variables
dotenv.config();

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

// List collections and check user data
async function checkDatabase() {
  try {
    // Connect to the database
    const connected = await connectToDatabase();
    if (!connected) return;
    
    // List all collections in the database
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nCollections in database:');
      collections.forEach(coll => {
        console.log(`- ${coll.name}`);
      });
    }
    
    // Check if the users collection exists and has documents
    const usersCount = await User.countDocuments();
    console.log(`\nTotal users in database: ${usersCount}`);
    
    // Find admin users
    const adminUsers = await User.find({ role: { $in: ['admin', 'super-admin'] } });
    console.log(`Admin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\nAdmin users:');
      adminUsers.forEach(user => {
        console.log(`- Email: ${user.email}, Role: ${user.role}, ID: ${user._id}`);
        console.log(`  Status: ${user.status}, Name: ${user.firstName} ${user.lastName}`);
      });
    }
    
    // Find all users
    const allUsers = await User.find({});
    console.log(`\nAll users found: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\nAll users:');
      allUsers.forEach(user => {
        console.log(`- Email: ${user.email}, Role: ${user.role}, ID: ${user._id}`);
        console.log(`  Status: ${user.status}, Name: ${user.firstName} ${user.lastName}`);
        
        // Log available fields
        console.log('  Available fields:');
        const userObject = user.toObject();
        Object.keys(userObject).forEach(key => {
          const value = userObject[key];
          const displayValue = 
            key === 'password' ? '[REDACTED]' : 
            value instanceof Date ? value.toISOString() :
            typeof value === 'object' && value !== null ? '[Object]' : 
            String(value);
          console.log(`    ${key}: ${displayValue}`);
        });
      });
    } else {
      console.log('\nNo users found in the database!');
      
      // Provide guidance if no users found
      console.log('\nYou may need to:');
      console.log('1. Check if you are connecting to the correct database');
      console.log('2. Check if your users are stored in a different collection');
      console.log('3. Create a user if the database is new');
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\nClosed database connection');
  }
}

// Run the database check
checkDatabase()
  .then(() => console.log('Database check completed'))
  .catch(error => console.error('Error during database check:', error)); 