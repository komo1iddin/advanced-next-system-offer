import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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
    
    // Get the User model
    const User = mongoose.model('User');
    
    // Find all active users
    const users = await User.find({ status: 'active' });
    console.log(`Found ${users.length} active users to process`);
    
    // Process each user
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        // Generate reset token and expiry
        const resetToken = generateResetToken();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 24); // Token valid for 24 hours
        
        // Update user with reset token
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();
        
        // Send password reset email
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@example.com',
            to: user.email,
            subject: 'Password Reset Required',
            html: `
              <h1>Password Reset Required</h1>
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