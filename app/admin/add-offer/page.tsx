"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Progress } from "@/components/ui/progress";
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

// Define form steps
const formSteps = [
  { id: "basic", title: "Basic Information", description: "Enter general information about the study offer" },
  { id: "financial", title: "Financial Details", description: "Define tuition fees and scholarship options" },
  { id: "requirements", title: "Requirements", description: "Specify language and admission requirements" },
  { id: "facilities", title: "Facilities & Appearance", description: "Add campus facilities and customize appearance" },
  { id: "review", title: "Review & Submit", description: "Review all information and submit" },
];

export default function AdminAddOfferPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

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

  // Progress calculation
  const progress = Math.round(((currentStep + 1) / formSteps.length) * 100);

  // Handle validation for each step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    
    // Step 1: Basic Information
    if (currentStep === 0) {
      if (!title.trim()) newErrors.title = ["Title is required"];
      if (!description.trim()) newErrors.description = ["Description is required"];
      if (!location.trim()) newErrors.location = ["Location is required"];
      if (programs.length === 0) newErrors.programs = ["At least one program is required"];
      if (tags.length === 0) newErrors.tags = ["At least one tag is required"];
      
      // Validate university name only if source is not "agent"
      if (source !== "agent" && !universityName.trim()) {
        newErrors.universityName = ["University name is required"];
      }
      
      // Validate agent/universityDirect selection
      if (source === "agent" && !agentId) {
        newErrors.agentId = ["Please select an agent"];
      }
      
      if (source === "university direct" && !universityDirectId) {
        newErrors.universityDirectId = ["Please select a university contact"];
      }
    }
    
    // Step 2: Financial Details
    else if (currentStep === 1) {
      if (tuitionAmount <= 0) newErrors.tuitionAmount = ["Please enter a valid tuition amount"];
      if (scholarshipAvailable && !scholarshipDetails.trim()) {
        newErrors.scholarshipDetails = ["Please provide scholarship details"];
      }
    }
    
    // Step 3: Requirements
    else if (currentStep === 2) {
      if (languageRequirements.length === 0) {
        newErrors.languageRequirements = ["Please add at least one language requirement"];
      }
      
      if (admissionRequirements.length === 0) {
        newErrors.admissionRequirements = ["Please add at least one admission requirement"];
      }
    }
    
    // Step 4: Facilities & Appearance
    else if (currentStep === 3) {
      // Optional
    }
    
    setErrors(newErrors);
    
    // Valid if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Jump to a specific step
  const jumpToStep = (stepIndex: number) => {
    // Only allow jumping to steps that are completed or the next uncompleted step
    if (completedSteps.includes(stepIndex) || stepIndex === 0 || completedSteps.includes(stepIndex - 1)) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!validateCurrentStep()) {
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

  // Render form step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <>
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
            
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            {errors.universityName && <p className="text-sm text-destructive mt-1">{errors.universityName}</p>}
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
            {errors.agentId && <p className="text-sm text-destructive mt-1">{errors.agentId}</p>}
            {errors.universityDirectId && <p className="text-sm text-destructive mt-1">{errors.universityDirectId}</p>}
            
            <div className="space-y-4 md:col-span-2 mt-6">
              <h3 className="text-lg font-medium">Available Programs</h3>
              <TagInput 
                items={programs}
                setItems={setPrograms}
                placeholder="E.g., Computer Science, Business Administration"
                badgeVariant="secondary"
              />
              {errors.programs && <p className="text-sm text-destructive mt-1">{errors.programs}</p>}
            </div>
            
            <div className="space-y-4 md:col-span-2 mt-6">
              <h3 className="text-lg font-medium">Tags</h3>
              <TagInputSelector 
                items={tags}
                setItems={setTags}
                placeholder="E.g., scholarship, engineering, medicine"
                badgeVariant="outline"
                allowCustomTags={true}
              />
              {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags}</p>}
            </div>
          </>
        );
      
      case 1: // Financial Details
        return (
          <>
            <TuitionSection 
              tuitionAmount={tuitionAmount}
              setTuitionAmount={setTuitionAmount}
              tuitionCurrency={tuitionCurrency}
              setTuitionCurrency={setTuitionCurrency}
              tuitionPeriod={tuitionPeriod}
              setTuitionPeriod={setTuitionPeriod}
            />
            {errors.tuitionAmount && <p className="text-sm text-destructive mt-1">{errors.tuitionAmount}</p>}
            
            <ApplicationDeadlineSection 
              applicationDeadline={applicationDeadline}
              setApplicationDeadline={setApplicationDeadline}
            />
            
            <ScholarshipSection 
              scholarshipAvailable={scholarshipAvailable}
              setScholarshipAvailable={setScholarshipAvailable}
              scholarshipDetails={scholarshipDetails}
              setScholarshipDetails={setScholarshipDetails}
            />
            {errors.scholarshipDetails && <p className="text-sm text-destructive mt-1">{errors.scholarshipDetails}</p>}
          </>
        );
      
      case 2: // Requirements
        return (
          <>
            <LanguageRequirementsSection 
              languageRequirements={languageRequirements}
              setLanguageRequirements={setLanguageRequirements}
            />
            {errors.languageRequirements && <p className="text-sm text-destructive mt-1">{errors.languageRequirements}</p>}
            
            <div className="space-y-4 md:col-span-2 mt-6">
              <h3 className="text-lg font-medium">Admission Requirements</h3>
              <RequirementInput 
                items={admissionRequirements}
                setItems={setAdmissionRequirements}
                placeholder="E.g., High school diploma, Bachelor's degree"
              />
              {errors.admissionRequirements && <p className="text-sm text-destructive mt-1">{errors.admissionRequirements}</p>}
            </div>
          </>
        );
      
      case 3: // Facilities & Appearance
        return (
          <>
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-medium">Campus Facilities</h3>
              <TagInput 
                items={campusFacilities}
                setItems={setCampusFacilities}
                placeholder="E.g., Library, Sports center, Dormitories"
                badgeVariant="secondary"
              />
            </div>
            
            <AppearanceSection 
              selectedColorIndex={selectedColorIndex}
              setSelectedColorIndex={setSelectedColorIndex}
              featured={featured}
              setFeatured={setFeatured}
            />
          </>
        );
      
      case 4: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">Basic Information</h3>
              <dl className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Title:</dt>
                  <dd className="col-span-2">{title}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">University:</dt>
                  <dd className="col-span-2">{universityName}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Location:</dt>
                  <dd className="col-span-2">{location}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Degree Level:</dt>
                  <dd className="col-span-2">{degreeLevel}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Duration:</dt>
                  <dd className="col-span-2">{durationInYears} years</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Programs:</dt>
                  <dd className="col-span-2">{programs.join(", ")}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Tags:</dt>
                  <dd className="col-span-2">{tags.join(", ")}</dd>
                </div>
              </dl>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">Financial Details</h3>
              <dl className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Tuition:</dt>
                  <dd className="col-span-2">
                    {tuitionAmount} {tuitionCurrency} per {tuitionPeriod.toLowerCase()}
                  </dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Application Deadline:</dt>
                  <dd className="col-span-2">{applicationDeadline.toLocaleDateString()}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 py-2">
                  <dt className="font-medium text-muted-foreground">Scholarship:</dt>
                  <dd className="col-span-2">
                    {scholarshipAvailable ? "Available" : "Not available"}
                    {scholarshipAvailable && scholarshipDetails && (
                      <>
                        <br />
                        <span className="text-sm">{scholarshipDetails}</span>
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">Requirements</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">Language Requirements:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {languageRequirements.map((req, idx) => (
                      <li key={idx}>
                        {req.language}
                        {req.testName && req.minimumScore && `: ${req.testName} (${req.minimumScore})`}
                        {req.testName && !req.minimumScore && `: ${req.testName}`}
                        {!req.testName && req.minimumScore && `: ${req.minimumScore}`}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">Admission Requirements:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {admissionRequirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">Facilities & Appearance</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-muted-foreground mb-2">Campus Facilities:</dt>
                  <dd>
                    {campusFacilities.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {campusFacilities.map((facility, idx) => (
                          <li key={idx}>{facility}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No facilities specified</p>
                    )}
                  </dd>
                </div>
                <div className="pt-2">
                  <dt className="font-medium text-muted-foreground mb-2">Featured:</dt>
                  <dd>{featured ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

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
              
              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>

            <div className="border-b">
              <div className="flex overflow-x-auto scrollbar-hide">
                {formSteps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => jumpToStep(index)}
                    className={`flex flex-col items-start px-6 py-3 border-b-2 min-w-[150px] text-left transition-colors
                      ${currentStep === index ? 'border-primary' : 'border-transparent'}
                      ${completedSteps.includes(index) ? 'text-primary' : 'text-muted-foreground'}
                      ${(completedSteps.includes(index) || index === 0 || completedSteps.includes(index - 1)) ? 'hover:text-primary cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                    `}
                  >
                    <span className="flex items-center text-sm font-medium">
                      {completedSteps.includes(index) && (
                        <CheckCircle2 className="mr-1 h-4 w-4 text-primary" />
                      )}
                      {index + 1}. {step.title}
                    </span>
                    <span className="text-xs mt-1">{step.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderStepContent()}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6">
              <div>
                {currentStep > 0 && (
                  <Button variant="outline" type="button" onClick={handlePrevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>
              <div>
                {currentStep < formSteps.length - 1 ? (
                  <Button type="button" onClick={handleNextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Study Offer"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>

        <Toaster />
      </div>
    </div>
  );
} 