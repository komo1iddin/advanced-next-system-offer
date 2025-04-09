"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AdminPageLayout } from "@/components/ui/admin/page-layout";

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  maintenanceMode: boolean;
}

interface SocialMediaSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
}

interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  googleAnalyticsId: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "StudyBridge",
    siteDescription: "Your bridge to international education",
    contactEmail: "",
    supportEmail: "",
    phoneNumber: "",
    address: "",
    maintenanceMode: false,
  });

  // Social Media Settings State
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  });

  // SEO Settings State
  const [seoSettings, setSEOSettings] = useState<SEOSettings>({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    googleAnalyticsId: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        
        // Update General Settings
        setGeneralSettings({
          siteName: data.siteName || "StudyBridge",
          siteDescription: data.siteDescription || "Your bridge to international education",
          contactEmail: data.contactEmail || "",
          supportEmail: data.supportEmail || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          maintenanceMode: data.maintenanceMode || false,
        });

        // Update Social Media Settings
        setSocialMediaSettings({
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          youtube: data.youtube || "",
        });

        // Update SEO Settings
        setSEOSettings({
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          keywords: data.keywords || "",
          googleAnalyticsId: data.googleAnalyticsId || "",
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleGeneralSettingsChange = (
    key: keyof GeneralSettings,
    value: string | boolean
  ) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSocialMediaSettingsChange = (
    key: keyof SocialMediaSettings,
    value: string
  ) => {
    setSocialMediaSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSEOSettingsChange = (
    key: keyof SEOSettings,
    value: string
  ) => {
    setSEOSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generalSettings,
          socialMediaSettings,
          seoSettings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Success",
        description: "Settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save button for settings page
  const actionButton = (
    <Button type="submit" form="settings-form" disabled={isSaving} className="w-full sm:w-auto">
      <Save className="mr-2 h-4 w-4" />
      {isSaving ? "Saving..." : "Save Settings"}
    </Button>
  );

  // Breadcrumbs for this page
  const breadcrumbs = [
    { title: "Settings", href: "/admin/settings" }
  ];

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Settings"
        description="Manage your application settings and preferences"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Settings"
      description="Manage your application settings and preferences"
      actionButton={actionButton}
      breadcrumbs={breadcrumbs}
    >
      <form id="settings-form" onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic information about your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => handleGeneralSettingsChange("siteName", e.target.value)}
                      placeholder="Enter site name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={generalSettings.phoneNumber}
                      onChange={(e) => handleGeneralSettingsChange("phoneNumber", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => handleGeneralSettingsChange("siteDescription", e.target.value)}
                    placeholder="Enter site description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => handleGeneralSettingsChange("contactEmail", e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => handleGeneralSettingsChange("supportEmail", e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={generalSettings.address}
                    onChange={(e) => handleGeneralSettingsChange("address", e.target.value)}
                    placeholder="Enter physical address"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleGeneralSettingsChange("maintenanceMode", checked)}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Set your social media profiles for sharing and connecting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialMediaSettings.facebook}
                      onChange={(e) => handleSocialMediaSettingsChange("facebook", e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={socialMediaSettings.twitter}
                      onChange={(e) => handleSocialMediaSettingsChange("twitter", e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialMediaSettings.instagram}
                      onChange={(e) => handleSocialMediaSettingsChange("instagram", e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialMediaSettings.linkedin}
                      onChange={(e) => handleSocialMediaSettingsChange("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={socialMediaSettings.youtube}
                    onChange={(e) => handleSocialMediaSettingsChange("youtube", e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your site for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={seoSettings.metaTitle}
                    onChange={(e) => handleSEOSettingsChange("metaTitle", e.target.value)}
                    placeholder="Enter meta title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={seoSettings.metaDescription}
                    onChange={(e) => handleSEOSettingsChange("metaDescription", e.target.value)}
                    placeholder="Enter meta description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Textarea
                    id="keywords"
                    value={seoSettings.keywords}
                    onChange={(e) => handleSEOSettingsChange("keywords", e.target.value)}
                    placeholder="Enter keywords separated by commas"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => handleSEOSettingsChange("googleAnalyticsId", e.target.value)}
                    placeholder="e.g. UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
      <Toaster />
    </AdminPageLayout>
  );
} 