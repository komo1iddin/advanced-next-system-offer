// Script to check MongoDB connection and retrieve study offers
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");
    
    // List all databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    
    // Determine the database from the connection string
    const dbName = new URL(uri).pathname.substring(1);
    console.log(`\nUsing database: ${dbName}`);
    
    // List all collections
    const database = client.db();
    const collections = await database.listCollections().toArray();
    console.log("Collections:");
    collections.forEach(collection => console.log(` - ${collection.name}`));
    
    // Check the studyOffers collection
    console.log("\nChecking studyOffers collection:");
    const studyOffers = await database.collection("studyOffers").find({}).toArray();
    console.log(`Found ${studyOffers.length} study offers`);
    
    if (studyOffers.length > 0) {
      console.log("\nSample study offer:");
      console.log(JSON.stringify(studyOffers[0], null, 2).substring(0, 500) + "...");
    }
    
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

checkDatabase()
  .then(() => console.log("Database check completed"))
  .catch(err => console.error("Database check failed:", err)); 