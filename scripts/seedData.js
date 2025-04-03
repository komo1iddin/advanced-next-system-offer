// MongoDB Study Offers Seed Data
// Run with: node seedData.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// MongoDB Connection URL from environment variables
const uri = process.env.MONGODB_URI;

// Random color generation for cards
const cardColors = [
  { bg: "bg-rose-50", accent: "border-rose-200 text-rose-600" },
  { bg: "bg-blue-50", accent: "border-blue-200 text-blue-600" },
  { bg: "bg-amber-50", accent: "border-amber-200 text-amber-600" },
  { bg: "bg-emerald-50", accent: "border-emerald-200 text-emerald-600" },
  { bg: "bg-violet-50", accent: "border-violet-200 text-violet-600" },
  { bg: "bg-orange-50", accent: "border-orange-200 text-orange-600" },
];

// Helper function to get a random color pair
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * cardColors.length);
  return cardColors[randomIndex];
}

// Study offers data based on the provided information
const studyOffers = [
  {
    title: "EXPRESS Chinese Language Course (6 months)",
    universityName: "Chengdu University",
    description: "6-month intensive Chinese language course in Chengdu with quick admission process. Perfect for those looking to start studying in China quickly. Direct flights available from Tashkent to Chengdu.",
    location: "Chengdu, China",
    degreeLevel: "Language Course",
    programs: ["Chinese Language"],
    tuitionFees: {
      amount: 850,
      currency: "USD",
      period: "semester"
    },
    scholarshipAvailable: false,
    applicationDeadline: new Date("2023-04-15"),
    languageRequirements: [
      {
        language: "English",
        minimumScore: "Basic",
      }
    ],
    durationInYears: 0.5, // 6 months
    campusFacilities: [
      "Library",
      "Computer Lab",
      "Student Cafeteria",
      "Language Learning Center"
    ],
    admissionRequirements: [
      "Passport",
      "High School Diploma",
      "Transcript",
      "Medical Examination (not older than 6 months)",
      "Certificate of No Criminal Record",
      "3x4 Photo"
    ],
    tags: ["#tilkursi", "#chendu", "ExpressAdmission", "ChineseLanguage"],
    color: "bg-blue-50",
    accentColor: "border-blue-200 text-blue-600",
    category: "Language Course",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Full Scholarship Chinese Language Program (1 year)",
    universityName: "Chengdu University",
    description: "One-year fully funded Chinese language program in Chengdu. This program offers free tuition and accommodation for successful applicants. Direct flights available from Tashkent to Chengdu.",
    location: "Chengdu, China",
    degreeLevel: "Language Course",
    programs: ["Chinese Language"],
    tuitionFees: {
      amount: 0, // Free tuition
      currency: "USD",
      period: "year"
    },
    scholarshipAvailable: true,
    scholarshipDetails: "Type A Scholarship: Free tuition + free accommodation for the entire program duration.",
    applicationDeadline: new Date("2023-04-20"),
    languageRequirements: [
      {
        language: "English",
        minimumScore: "Basic",
      }
    ],
    durationInYears: 1,
    campusFacilities: [
      "Library",
      "Computer Lab",
      "Student Dormitory",
      "Student Cafeteria",
      "Sports Facilities",
      "Language Learning Center"
    ],
    admissionRequirements: [
      "Passport",
      "High School Diploma",
      "Transcript",
      "Medical Examination (not older than 6 months)",
      "Certificate of No Criminal Record",
      "3x4 Photo",
      "Self-introduction Video (1 minute)"
    ],
    tags: ["#tilkursi", "#chendu", "FullScholarship", "ChineseLanguage", "FreeAccommodation"],
    color: "bg-emerald-50",
    accentColor: "border-emerald-200 text-emerald-600",
    category: "Language Course",
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Guangzhou Chinese Language Program (1 year)",
    universityName: "Guangzhou University",
    description: "One-year Chinese language program in Guangzhou with multiple scholarship options. Study in one of China's most vibrant cities with direct flights from Tashkent.",
    location: "Guangzhou, China",
    degreeLevel: "Language Course",
    programs: ["Chinese Language"],
    tuitionFees: {
      amount: 0, // Free tuition
      currency: "USD",
      period: "year"
    },
    scholarshipAvailable: true,
    scholarshipDetails: "Type A Scholarship: Free tuition + free accommodation\nType B Scholarship: Free tuition + subsidized accommodation ($300/year)",
    applicationDeadline: new Date("2023-04-31"), // Note: April doesn't have 31 days, but keeping as specified
    languageRequirements: [
      {
        language: "English",
        minimumScore: "Basic",
      }
    ],
    durationInYears: 1,
    campusFacilities: [
      "Library",
      "Computer Lab",
      "Student Dormitory",
      "Student Cafeteria",
      "Sports Facilities",
      "Language Learning Center",
      "Cultural Exchange Center"
    ],
    admissionRequirements: [
      "Passport",
      "High School Diploma",
      "Transcript",
      "Medical Examination (not older than 6 months)",
      "Certificate of No Criminal Record",
      "3x4 Photo",
      "Self-introduction Video (1 minute)"
    ],
    tags: ["#tilkursi", "#guangzhou", "Scholarship", "ChineseLanguage"],
    color: "bg-amber-50",
    accentColor: "border-amber-200 text-amber-600",
    category: "Language Course",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db(); // Uses the database from the connection string
    const collection = database.collection("studyOffers");
    
    // Delete existing documents (optional)
    await collection.deleteMany({});
    console.log("Cleared existing study offers");
    
    // Insert new documents
    const result = await collection.insertMany(studyOffers);
    console.log(`${result.insertedCount} study offers inserted`);
    
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

seedDatabase()
  .then(() => console.log("Seeding completed"))
  .catch(err => console.error("Seeding failed:", err)); 