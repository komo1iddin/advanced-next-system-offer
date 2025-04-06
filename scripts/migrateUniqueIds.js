/**
 * Migration script to add unique IDs to existing study offers
 * 
 * Run this script with: node scripts/migrateUniqueIds.js
 */

// Import required modules
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log(`Loading environment from ${envLocalPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} else {
  console.warn('.env.local file not found, falling back to .env');
  dotenv.config();
}

// Verify MongoDB URI is available
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Define the prefix map
const prefixMap = {
  'Bachelor': 'BCHLR',
  'Master': 'MSTR',
  'PhD': 'PHD',
  'Certificate': 'CERT',
  'Diploma': 'DPLM',
  'Language Course': 'LANG'
};

// Generate a random alphanumeric string of specified length
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Generate a unique ID for a study offer based on its degree level
function generateUniqueId(degreeLevel) {
  const prefix = prefixMap[degreeLevel] || 'OFFER';
  const randomString = generateRandomString(6);
  const year = new Date().getFullYear().toString().slice(-2);
  return `${prefix}~${year}${randomString}`;
}

// Create a simple model for StudyOffer
const StudyOffer = mongoose.model('StudyOffer', new mongoose.Schema({
  uniqueId: { type: String, unique: true, index: true },
  degreeLevel: { type: String },
}), 'studyOffers');

// Main migration function
async function migrateUniqueIds() {
  try {
    console.log('Starting migration...');
    
    // Get all offers without a uniqueId
    const offers = await StudyOffer.find({ uniqueId: { $exists: false } });
    console.log(`Found ${offers.length} offers without uniqueId`);
    
    // Keep track of generated IDs to avoid duplicates
    const generatedIds = new Set();
    
    // Update each offer
    for (const offer of offers) {
      // Generate a unique ID
      let uniqueId;
      let isUnique = false;
      
      while (!isUnique) {
        uniqueId = generateUniqueId(offer.degreeLevel);
        
        // Check if this ID has already been generated
        if (!generatedIds.has(uniqueId)) {
          // Check if this ID exists in the database
          const existingOffer = await StudyOffer.findOne({ uniqueId });
          if (!existingOffer) {
            isUnique = true;
            generatedIds.add(uniqueId);
          }
        }
      }
      
      // Update the offer with the unique ID
      await StudyOffer.updateOne({ _id: offer._id }, { $set: { uniqueId } });
      console.log(`Updated offer ${offer._id} with uniqueId ${uniqueId}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the migration
migrateUniqueIds(); 