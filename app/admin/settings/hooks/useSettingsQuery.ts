import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

// Interfaces for settings data
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  maintenanceMode: boolean;
}

export interface SocialMediaSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  googleAnalyticsId: string;
}

export interface Settings {
  generalSettings: GeneralSettings;
  socialMediaSettings: SocialMediaSettings;
  seoSettings: SEOSettings;
}

// Fetch function for settings
const fetchSettings = async (): Promise<Settings> => {
  const response = await fetch("/api/admin/settings");
  
  if (response.status === 401) {
    throw new Error("Unauthorized. Please log in.");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }
  
  const data = await response.json();
  
  // Transform API response into the expected format
  return {
    generalSettings: {
      siteName: data.siteName || "StudyBridge",
      siteDescription: data.siteDescription || "Your bridge to international education",
      contactEmail: data.contactEmail || "",
      supportEmail: data.supportEmail || "",
      phoneNumber: data.phoneNumber || "",
      address: data.address || "",
      maintenanceMode: data.maintenanceMode || false,
    },
    socialMediaSettings: {
      facebook: data.facebook || "",
      twitter: data.twitter || "",
      instagram: data.instagram || "",
      linkedin: data.linkedin || "",
      youtube: data.youtube || "",
    },
    seoSettings: {
      metaTitle: data.metaTitle || "",
      metaDescription: data.metaDescription || "",
      keywords: data.keywords || "",
      googleAnalyticsId: data.googleAnalyticsId || "",
    }
  };
};

// Hook for fetching settings
export function useSettingsQuery() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 Unauthorized
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 3;
    }
  });
} 