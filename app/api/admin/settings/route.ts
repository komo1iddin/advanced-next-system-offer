import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();
    
    // Find settings or create default if none exists
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { generalSettings, socialMediaSettings, seoSettings } = body;

    // Connect to the database
    await connectToDatabase();
    
    // Find settings document or create a new one
    let settings = await Settings.findOne();
    
    if (settings) {
      // Update existing settings
      settings.siteName = generalSettings.siteName;
      settings.siteDescription = generalSettings.siteDescription;
      settings.contactEmail = generalSettings.contactEmail;
      settings.supportEmail = generalSettings.supportEmail;
      settings.phoneNumber = generalSettings.phoneNumber;
      settings.address = generalSettings.address;
      settings.maintenanceMode = generalSettings.maintenanceMode;
      
      // Social Media Settings
      settings.facebook = socialMediaSettings.facebook;
      settings.twitter = socialMediaSettings.twitter;
      settings.instagram = socialMediaSettings.instagram;
      settings.linkedin = socialMediaSettings.linkedin;
      settings.youtube = socialMediaSettings.youtube;
      
      // SEO Settings
      settings.metaTitle = seoSettings.metaTitle;
      settings.metaDescription = seoSettings.metaDescription;
      settings.keywords = seoSettings.keywords;
      settings.googleAnalyticsId = seoSettings.googleAnalyticsId;
      
      await settings.save();
    } else {
      // Create new settings
      settings = await Settings.create({
        // General Settings
        siteName: generalSettings.siteName,
        siteDescription: generalSettings.siteDescription,
        contactEmail: generalSettings.contactEmail,
        supportEmail: generalSettings.supportEmail,
        phoneNumber: generalSettings.phoneNumber,
        address: generalSettings.address,
        maintenanceMode: generalSettings.maintenanceMode,
        
        // Social Media Settings
        facebook: socialMediaSettings.facebook,
        twitter: socialMediaSettings.twitter,
        instagram: socialMediaSettings.instagram,
        linkedin: socialMediaSettings.linkedin,
        youtube: socialMediaSettings.youtube,
        
        // SEO Settings
        metaTitle: seoSettings.metaTitle,
        metaDescription: seoSettings.metaDescription,
        keywords: seoSettings.keywords,
        googleAnalyticsId: seoSettings.googleAnalyticsId,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 