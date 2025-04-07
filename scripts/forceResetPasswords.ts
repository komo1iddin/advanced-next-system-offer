import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import './loadModels'; // Load all models first
import User from '../lib/models/User'; // Now import specific models

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
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a reset token
function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

// Force password reset for all users
async function forcePasswordReset() {
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
    
    // Find all users, not just active ones
    const users = await User.find({});
    
    // Debug: Log users found
    console.log('Users found:', users.length);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- User: ${user.email}, Role: ${user.role}, ID: ${user._id}`);
      });
    } else {
      console.log('No users found in the database at all!');
    }
    
    console.log(`Processing ${users.length} users for password reset`);
    
    // Process each user
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        // Generate reset token and expiry
        const resetToken = generateResetToken();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 24); // Token valid for 24 hours
        
        // Use direct MongoDB update to bypass Mongoose validation
        // This avoids the firstName/lastName validation issue
        if (mongoose.connection.db) {
          const result = await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { 
              $set: { 
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires
              } 
            }
          );
          
          if (result.modifiedCount === 0) {
            console.log(`No changes made to ${user.email}`);
            failCount++;
            continue;
          }
        } else {
          throw new Error('Database connection not established');
        }
        
        // Send password reset email
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@example.com',
            to: user.email,
            subject: 'Password Reset Required',
            html: `
              <h1>Password Reset Required</h1>
              <p>Hello ${user.name || 'User'},</p>
              <p>We've updated our password security system and need you to reset your password.</p>
              <p>Please click the link below to set a new password:</p>
              <a href="${resetUrl}">Reset Password</a>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not request this reset, please contact support immediately.</p>
            `,
          });
          
          console.log(`Password reset email sent to ${user.email}`);
          successCount++;
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to process user ${user.email}:`, error);
        failCount++;
      }
    }
    
    console.log('\nPassword Reset Summary:');
    console.log(`Total users: ${users.length}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Failed to process: ${failCount}`);
  } catch (error) {
    console.error('Password reset operation failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Closed database connection');
  }
}

// Run the password reset
forcePasswordReset()
  .then(() => console.log('Password reset operation completed'))
  .catch(error => console.error('Error during password reset operation:', error)); 