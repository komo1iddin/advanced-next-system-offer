import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  // General Settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  maintenanceMode: boolean;
  
  // Social Media Settings
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  googleAnalyticsId: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    // General Settings
    siteName: { type: String, default: "StudyBridge" },
    siteDescription: { type: String, default: "Your bridge to international education" },
    contactEmail: { type: String, default: "" },
    supportEmail: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    
    // Social Media Settings
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    youtube: { type: String, default: "" },
    
    // SEO Settings
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: 'settings'
  }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema); 