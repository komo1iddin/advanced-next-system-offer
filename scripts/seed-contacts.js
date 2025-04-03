// This script seeds the database with sample agents and university direct contacts
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define models directly (since we're not using TypeScript in this script)
let Agent;
let UniversityDirect;

// Sample data for agents
const sampleAgents = [
  {
    name: "Global Education Partners",
    description: "Specializing in connecting students with top universities in China, Europe, and North America",
    whatsapp: "+86123456789",
    whatsappGroup: "https://chat.whatsapp.com/globaledpartners",
    wechat: "global_ed_partners",
    email: "contact@globaledupartners.com",
    website: "https://www.globaledupartners.com",
    telephone: "+86 10 8765 4321",
    active: true
  },
  {
    name: "China Study Advisors",
    description: "Premier agency for international students seeking education opportunities in China",
    wechat: "china_study_advisors",
    wechatGroup: "CSA_Students_2023",
    telegram: "@chinastudyadvisors",
    email: "info@chinastudyadvisors.cn",
    website: "https://www.chinastudyadvisors.cn",
    telephone: "+86 21 5432 1098",
    active: true
  },
  {
    name: "Asian Education Consultants",
    description: "Helping students navigate admission processes for universities across Asia",
    whatsapp: "+8523456789",
    facebookPage: "https://facebook.com/asianeduconsult",
    facebookGroup: "https://facebook.com/groups/asianeduconsult",
    email: "info@asianeduconsult.com",
    website: "https://www.asianeduconsult.com",
    telephone: "+852 2345 6789",
    active: true
  },
  {
    name: "Shanghai Student Services",
    description: "Specialized in placing students in Shanghai-based universities and programs",
    wechat: "sh_student_services",
    telegram: "@shanghaistudentservices",
    telegramGroup: "https://t.me/shanghaistudents",
    email: "contact@shanghaistudents.cn",
    website: "https://shanghaistudents.cn",
    telephone: "+86 21 6789 0123",
    active: true
  },
  {
    name: "Beijing International Education",
    description: "Comprehensive support for international students in Beijing universities",
    whatsapp: "+86987654321",
    wechat: "beijing_intl_edu",
    email: "support@beijingintedu.com",
    website: "https://www.beijingintedu.com",
    telephone: "+86 10 1234 5678",
    active: true
  }
];

// Sample data for university direct contacts
const sampleUniversityDirects = [
  {
    universityName: "Fudan University",
    departmentName: "International Student Office",
    contactPersonName: "Li Wei",
    position: "Director of International Affairs",
    description: "Main contact for international student admissions at Fudan University",
    wechat: "fudan_li_wei",
    telephone: "+86 21 6564 2222",
    email: "international@fudan.edu.cn",
    website: "https://iso.fudan.edu.cn",
    active: true
  },
  {
    universityName: "Tsinghua University",
    departmentName: "Office of International Students",
    contactPersonName: "Zhang Min",
    position: "International Admissions Coordinator",
    description: "Handles undergraduate and graduate admissions for international students",
    wechat: "tsinghua_intl",
    telephone: "+86 10 6278 1111",
    email: "admissions@tsinghua.edu.cn",
    website: "https://international.tsinghua.edu.cn",
    active: true
  },
  {
    universityName: "Shanghai Jiao Tong University",
    departmentName: "International Education College",
    contactPersonName: "Chen Jian",
    position: "Student Affairs Manager",
    description: "Contact for admission inquiries and student support",
    wechat: "sjtu_iec",
    telephone: "+86 21 3420 3333",
    email: "iec@sjtu.edu.cn",
    website: "https://iec.sjtu.edu.cn",
    active: true
  },
  {
    universityName: "Peking University",
    departmentName: "School of International Studies",
    contactPersonName: "Wang Li",
    position: "Foreign Student Advisor",
    description: "Primary contact for international program information",
    wechat: "pku_intl_wang",
    telephone: "+86 10 6275 4444",
    email: "international@pku.edu.cn",
    website: "https://www.sis.pku.edu.cn",
    active: true
  },
  {
    universityName: "Zhejiang University",
    departmentName: "College of International Education",
    contactPersonName: "Xu Feng",
    position: "Admissions Director",
    description: "Oversees international student recruitment and admissions",
    wechat: "zju_xu_feng",
    telephone: "+86 571 8795 5555",
    email: "admissions@intl.zju.edu.cn",
    website: "https://www.cie.zju.edu.cn",
    active: true
  }
];

// MongoDB Connection URL from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB...');

    // Define model schemas
    // Agent Schema
    const agentSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        whatsapp: { type: String, trim: true },
        whatsappGroup: { type: String, trim: true },
        wechat: { type: String, trim: true },
        wechatGroup: { type: String, trim: true },
        telegram: { type: String, trim: true },
        telegramGroup: { type: String, trim: true },
        telephone: { type: String, trim: true },
        facebookPage: { type: String, trim: true },
        facebookGroup: { type: String, trim: true },
        email: { type: String, trim: true },
        website: { type: String, trim: true },
        active: { type: Boolean, default: true }
      },
      {
        timestamps: true,
        collection: 'agents'
      }
    );

    // University Direct Schema
    const universityDirectSchema = new mongoose.Schema(
      {
        universityName: { type: String, required: true, trim: true },
        departmentName: { type: String, trim: true },
        contactPersonName: { type: String, trim: true },
        position: { type: String, trim: true },
        description: { type: String, trim: true },
        wechat: { type: String, trim: true },
        telephone: { type: String, trim: true },
        email: { type: String, trim: true },
        website: { type: String, trim: true },
        active: { type: Boolean, default: true }
      },
      {
        timestamps: true,
        collection: 'universityDirects'
      }
    );

    // Create models
    Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
    UniversityDirect = mongoose.models.UniversityDirect || mongoose.model('UniversityDirect', universityDirectSchema);

    // Check if data already exists
    const agentCount = await Agent.countDocuments();
    const universityDirectCount = await UniversityDirect.countDocuments();

    console.log(`Current counts - Agents: ${agentCount}, University Directs: ${universityDirectCount}`);

    // Only seed if collections are empty or have fewer than 5 documents
    if (agentCount < 5) {
      // Clear existing data
      await Agent.deleteMany({});
      console.log('Cleared existing agents...');

      // Insert sample agents
      const agentsResult = await Agent.insertMany(sampleAgents);
      console.log(`Added ${agentsResult.length} sample agents`);
    } else {
      console.log(`Skipping agent seeding: ${agentCount} agents already exist`);
    }

    if (universityDirectCount < 5) {
      // Clear existing data
      await UniversityDirect.deleteMany({});
      console.log('Cleared existing university directs...');

      // Insert sample university directs
      const uniDirectResult = await UniversityDirect.insertMany(sampleUniversityDirects);
      console.log(`Added ${uniDirectResult.length} sample university directs`);
    } else {
      console.log(`Skipping university direct seeding: ${universityDirectCount} university directs already exist`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase(); 