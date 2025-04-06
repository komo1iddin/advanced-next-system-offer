"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { TagInputSelector } from "../../components/TagInputSelector";

// Import form components from the original add-offer page
import {
  TagInput,
  RequirementInput,
  BasicInfoSection,
  TuitionSection,
  ApplicationDeadlineSection,
  ScholarshipSection,
  LanguageRequirementsSection,
  AppearanceSection,
} from "../../add-offer/components";

// Color options for cards - needed for the form submission
const cardColors = [
  { bg: "bg-rose-50", accent: "border-rose-200 text-rose-600" },
  { bg: "bg-blue-50", accent: "border-blue-200 text-blue-600" },
  { bg: "bg-amber-50", accent: "border-amber-200 text-amber-600" },
  { bg: "bg-emerald-50", accent: "border-emerald-200 text-emerald-600" },
  { bg: "bg-violet-50", accent: "border-violet-200 text-violet-600" },
  { bg: "bg-orange-50", accent: "border-orange-200 text-orange-600" },
];

// Available categories
const degreeLevels = [
  "Bachelor",
  "Master",
  "PhD",
  "Certificate",
  "Diploma",
  "Language Course",
];

// Available currencies
const currencies = ["USD", "CNY", "EUR", "GBP"];

// Available periods
const periods = ["Year", "Semester", "Course", "Month"];

// University categories
const categories = [
  "University",
  "College"
];

export default function AdminAddOfferPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin/add-offer");
  }

  // Form state for basic information
  const [title, setTitle] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [cityId, setCityId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("Bachelor");
  const [category, setCategory] = useState("University");
  const [durationInYears, setDurationInYears] = useState(4);
  const [source, setSource] = useState("university direct");
  const [agentId, setAgentId] = useState("");
  const [universityDirectId, setUniversityDirectId] = useState("");
  
  // Programs
  const [programs, setPrograms] = useState<string[]>([]);
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  
  // Application deadline
  const [applicationDeadline, setApplicationDeadline] = useState<Date>(new Date());
  
  // Tuition fees
  const [tuitionAmount, setTuitionAmount] = useState(0);
  const [tuitionCurrency, setTuitionCurrency] = useState("USD");
  const [tuitionPeriod, setTuitionPeriod] = useState("Year");
  
  // Scholarship
  const [scholarshipAvailable, setScholarshipAvailable] = useState(false);
  const [scholarshipDetails, setScholarshipDetails] = useState("");
  
  // Language requirements
  const [languageRequirements, setLanguageRequirements] = useState<{
    language: string;
    minimumScore?: string;
    testName?: string;
  }[]>([]);
  
  // Admission requirements
  const [admissionRequirements, setAdmissionRequirements] = useState<string[]>([]);
  
  // Campus facilities
  const [campusFacilities, setCampusFacilities] = useState<string[]>([]);
  
  // Additional
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [featured, setFeatured] = useState(false);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title for the study offer", variant: "destructive" });
      return;
    }
    
    // Only validate university name if source is not "agent"
    if (source !== "agent" && !universityName.trim()) {
      toast({ title: "Error", description: "Please enter the university name", variant: "destructive" });
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Error", description: "Please enter a description", variant: "destructive" });
      return;
    }
    
    if (!location.trim()) {
      toast({ title: "Error", description: "Please enter the location", variant: "destructive" });
      return;
    }
    
    if (programs.length === 0) {
      toast({ title: "Error", description: "Please add at least one program", variant: "destructive" });
      return;
    }
    
    if (tags.length === 0) {
      toast({ title: "Error", description: "Please add at least one tag", variant: "destructive" });
      return;
    }
    
    if (tuitionAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid tuition amount", variant: "destructive" });
      return;
    }
    
    if (scholarshipAvailable && !scholarshipDetails.trim()) {
      toast({ title: "Error", description: "Please provide scholarship details", variant: "destructive" });
      return;
    }
    
    if (languageRequirements.length === 0) {
      toast({ title: "Error", description: "Please add at least one language requirement", variant: "destructive" });
      return;
    }
    
    if (admissionRequirements.length === 0) {
      toast({ title: "Error", description: "Please add at least one admission requirement", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create study offer object
      const studyOfferData = {
        title: title.trim(),
        universityName: universityName.trim(),
        description: description.trim(),
        location: location.trim(),
        cityId: cityId || undefined,
        provinceId: provinceId || undefined,
        degreeLevel,
        programs,
        tuitionFees: {
          amount: Number(tuitionAmount),
          currency: tuitionCurrency,
          period: tuitionPeriod,
        },
        scholarshipAvailable,
        scholarshipDetails: scholarshipDetails.trim(),
        applicationDeadline,
        languageRequirements,
        durationInYears: Number(durationInYears),
        campusFacilities,
        admissionRequirements,
        tags,
        color: cardColors[selectedColorIndex].bg,
        accentColor: cardColors[selectedColorIndex].accent,
        category,
        source,
        agentId: source === "agent" && agentId ? agentId : undefined,
        universityDirectId: source === "university direct" && universityDirectId ? universityDirectId : undefined,
        featured,
      };
      
      // Send data to API
      const response = await fetch('/api/study-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyOfferData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create study offer');
      }
      
      // Show success message
      toast({
        title: "Success",
        description: "Study offer has been added successfully",
      });
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
      
    } catch (error) {
      console.error('Error creating study offer:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create study offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <Card className="border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-primary">
                <PlusCircle className="h-5 w-5" />
                Add New Study Offer
              </CardTitle>
              <CardDescription>Create a new study offer for a Chinese university</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <BasicInfoSection 
                  title={title}
                  setTitle={setTitle}
                  universityName={universityName}
                  setUniversityName={setUniversityName}
                  description={description}
                  setDescription={setDescription}
                  location={location}
                  setLocation={setLocation}
                  cityId={cityId}
                  setCityId={setCityId}
                  provinceId={provinceId}
                  setProvinceId={setProvinceId}
                  degreeLevel={degreeLevel}
                  setDegreeLevel={setDegreeLevel}
                  category={category}
                  setCategory={setCategory}
                  durationInYears={durationInYears}
                  setDurationInYears={setDurationInYears}
                  source={source}
                  setSource={setSource}
                  agentId={agentId}
                  setAgentId={setAgentId}
                  universityDirectId={universityDirectId}
                  setUniversityDirectId={setUniversityDirectId}
                />
                
                {/* Programs */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Available Programs</h3>
                  <TagInput 
                    items={programs}
                    setItems={setPrograms}
                    placeholder="E.g., Computer Science, Business Administration"
                    badgeVariant="secondary"
                  />
                </div>
                
                {/* Tags */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <TagInputSelector 
                    items={tags}
                    setItems={setTags}
                    placeholder="E.g., scholarship, engineering, medicine"
                    badgeVariant="outline"
                    allowCustomTags={true}
                  />
                </div>
                
                {/* Tuition Fees */}
                <TuitionSection 
                  tuitionAmount={tuitionAmount}
                  setTuitionAmount={setTuitionAmount}
                  tuitionCurrency={tuitionCurrency}
                  setTuitionCurrency={setTuitionCurrency}
                  tuitionPeriod={tuitionPeriod}
                  setTuitionPeriod={setTuitionPeriod}
                />
                
                {/* Application Deadline */}
                <ApplicationDeadlineSection 
                  applicationDeadline={applicationDeadline}
                  setApplicationDeadline={setApplicationDeadline}
                />
                
                {/* Scholarship Information */}
                <ScholarshipSection 
                  scholarshipAvailable={scholarshipAvailable}
                  setScholarshipAvailable={setScholarshipAvailable}
                  scholarshipDetails={scholarshipDetails}
                  setScholarshipDetails={setScholarshipDetails}
                />
                
                {/* Language Requirements */}
                <LanguageRequirementsSection 
                  languageRequirements={languageRequirements}
                  setLanguageRequirements={setLanguageRequirements}
                />
                
                {/* Admission Requirements */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Admission Requirements</h3>
                  <RequirementInput 
                    items={admissionRequirements}
                    setItems={setAdmissionRequirements}
                    placeholder="E.g., High school diploma, Bachelor's degree"
                  />
                </div>
                
                {/* Campus Facilities */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Campus Facilities</h3>
                  <TagInput 
                    items={campusFacilities}
                    setItems={setCampusFacilities}
                    placeholder="E.g., Library, Sports center, Dormitories"
                    badgeVariant="secondary"
                  />
                </div>
                
                {/* Appearance */}
                <AppearanceSection 
                  selectedColorIndex={selectedColorIndex}
                  setSelectedColorIndex={setSelectedColorIndex}
                  featured={featured}
                  setFeatured={setFeatured}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" type="button" onClick={() => router.push("/admin")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Study Offer"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Toaster />
      </div>
    </div>
  );
} 