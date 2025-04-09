"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateSettings } from "./hooks/useUpdateSettings";
import { useSettingsQuery, GeneralSettings, SocialMediaSettings, SEOSettings, Settings } from "./hooks/useSettingsQuery";

// Removed AdminPageLayout import

// Define interfaces for settings
// Using the interfaces from the hook instead

export default function SettingsPage() {
  const { data: session } = useSession();
  
  // Use our React Query hooks
  const { data: settings, isLoading, isError, error, refetch } = useSettingsQuery();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings();

  // State for form data
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    supportEmail: "",
    phoneNumber: "",
    address: "",
    maintenanceMode: false,
  });

  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  });

  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    googleAnalyticsId: "",
  });

  // Load settings from API when component mounts
  useEffect(() => {
    if (settings) {
      setGeneralSettings({
        siteName: settings.generalSettings?.siteName || "",
        siteDescription: settings.generalSettings?.siteDescription || "",
        contactEmail: settings.generalSettings?.contactEmail || "",
        supportEmail: settings.generalSettings?.supportEmail || "",
        phoneNumber: settings.generalSettings?.phoneNumber || "",
        address: settings.generalSettings?.address || "",
        maintenanceMode: settings.generalSettings?.maintenanceMode ?? false,
      });

      setSocialMediaSettings({
        facebook: settings.socialMediaSettings?.facebook || "",
        twitter: settings.socialMediaSettings?.twitter || "",
        instagram: settings.socialMediaSettings?.instagram || "",
        linkedin: settings.socialMediaSettings?.linkedin || "",
        youtube: settings.socialMediaSettings?.youtube || "",
      });

      setSeoSettings({
        metaTitle: settings.seoSettings?.metaTitle || "",
        metaDescription: settings.seoSettings?.metaDescription || "",
        keywords: settings.seoSettings?.keywords || "",
        googleAnalyticsId: settings.seoSettings?.googleAnalyticsId || "",
      });
    }
  }, [settings]);

  // Handle changes in settings fields
  const handleGeneralChange = (field: keyof GeneralSettings, value: any) => {
    setGeneralSettings({ ...generalSettings, [field]: value });
  };

  const handleSocialMediaChange = (field: keyof SocialMediaSettings, value: string) => {
    setSocialMediaSettings({ ...socialMediaSettings, [field]: value });
  };

  const handleSEOChange = (field: keyof SEOSettings, value: string) => {
    setSeoSettings({ ...seoSettings, [field]: value });
  };

  // Submit function to save settings
  const handleSubmit = async () => {
    updateSettings({
      generalSettings,
      socialMediaSettings,
      seoSettings
    });
  };

  // Create an action button
  const actionButton = (
    <Button onClick={handleSubmit} disabled={isUpdating}>
      {isUpdating ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </>
      )}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <div className="mb-6 flex flex-col space-y-4">
          <div>
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground text-sm">Manage site settings and configuration</p>
            </div>
            <div className="sm:ml-auto">{actionButton}</div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load your settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 flex items-center justify-center">
              <svg className="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <div className="mb-6 flex flex-col space-y-4">
          <div>
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground text-sm">Manage site settings and configuration</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Settings</CardTitle>
            <CardDescription>There was a problem loading your settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">{error?.message || "An unknown error occurred"}</div>
            <Button className="mt-4" onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6 flex flex-col space-y-4">
        <div>
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage site settings and configuration</p>
          </div>
          <div className="sm:ml-auto">{actionButton}</div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Set the basic information about your site</p>
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    placeholder="My Amazing Site"
                    value={generalSettings.siteName}
                    onChange={(e) => handleGeneralChange("siteName", e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    placeholder="A brief description of your site"
                    className="min-h-[100px]"
                    value={generalSettings.siteDescription}
                    onChange={(e) => handleGeneralChange("siteDescription", e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Contact Information</h3>
                <p className="text-sm text-muted-foreground">Contact details displayed throughout your site</p>
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@example.com"
                      value={generalSettings.contactEmail}
                      onChange={(e) => handleGeneralChange("contactEmail", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      placeholder="support@example.com"
                      value={generalSettings.supportEmail}
                      onChange={(e) => handleGeneralChange("supportEmail", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Physical address"
                    value={generalSettings.address}
                    onChange={(e) => handleGeneralChange("address", e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={generalSettings.phoneNumber}
                    onChange={(e) => handleGeneralChange("phoneNumber", e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Site Features</h3>
                <p className="text-sm text-muted-foreground">Toggle site features and functionality</p>
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put your site in maintenance mode</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleGeneralChange("maintenanceMode", checked)}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Social Media Links</h3>
                <p className="text-sm text-muted-foreground">Add links to your social media profiles</p>
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/yourpage"
                      value={socialMediaSettings.facebook}
                      onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/yourhandle"
                      value={socialMediaSettings.twitter}
                      onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/yourprofile"
                      value={socialMediaSettings.instagram}
                      onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/company/yourcompany"
                      value={socialMediaSettings.linkedin}
                      onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/c/yourchannel"
                    value={socialMediaSettings.youtube}
                    onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">SEO Settings</h3>
                <p className="text-sm text-muted-foreground">Optimize your site for search engines</p>
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Default page title"
                    value={seoSettings.metaTitle}
                    onChange={(e) => handleSEOChange("metaTitle", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">The default title for pages without a specific title</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Default page description"
                    value={seoSettings.metaDescription}
                    onChange={(e) => handleSEOChange("metaDescription", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">The default description for pages without a specific description</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="keywords">Meta Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={seoSettings.keywords}
                    onChange={(e) => handleSEOChange("keywords", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Comma-separated keywords for search engines</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    placeholder="UA-XXXXXXXX-X or G-XXXXXXXXXX"
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => handleSEOChange("googleAnalyticsId", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Your Google Analytics tracking ID</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 