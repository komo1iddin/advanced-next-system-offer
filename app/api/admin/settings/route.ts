import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { generalSettings, socialMediaSettings, seoSettings } = body;

    const settings = await prisma.settings.upsert({
      where: {
        id: 1, // We'll always use ID 1 for global settings
      },
      update: {
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
      },
      create: {
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
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 