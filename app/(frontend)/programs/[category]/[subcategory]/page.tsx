"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight, GraduationCap, School, Clock, CalendarDays, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { programCategories, ProgramCategory, ProgramSubcategory } from "@/app/components/layout/program-categories-sidebar";

// Sample university data offering these programs
const sampleUniversities = [
  {
    id: "beida",
    name: "Peking University",
    rank: "#1 in China",
    location: "Beijing",
    tuition: "$8,000 - $12,000 USD/year",
    deadline: "February 28",
    programs: ["Bachelor's", "Master's", "Doctoral"],
    languages: ["Chinese", "English"],
  },
  {
    id: "tsinghua",
    name: "Tsinghua University",
    rank: "#2 in China",
    location: "Beijing",
    tuition: "$8,500 - $14,000 USD/year",
    deadline: "March 15",
    programs: ["Bachelor's", "Master's", "Doctoral"],
    languages: ["Chinese", "English"],
  },
  {
    id: "fudan",
    name: "Fudan University",
    rank: "#3 in China",
    location: "Shanghai",
    tuition: "$7,000 - $11,000 USD/year",
    deadline: "April 1",
    programs: ["Bachelor's", "Master's", "Doctoral"],
    languages: ["Chinese", "English"],
  }
];

export default function SubcategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const subcategoryId = params.subcategory as string;
  
  // Find the selected category and subcategory
  const category = (programCategories as any).find(
    (category: ProgramCategory) => category.id === categoryId
  );
  
  if (!category) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Category not found</AlertTitle>
          <AlertDescription>
            The category you requested does not exist. Please select a valid category from the sidebar.
            <div className="mt-2">
              <Link href="/programs" className="text-primary underline">
                Go back to all programs
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const selectedSubcategory = category.subcategories.find(
    (subcategory: ProgramSubcategory) => subcategory.id === subcategoryId
  );
  
  if (!selectedSubcategory) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Program not found</AlertTitle>
          <AlertDescription>
            The program you requested does not exist. Please select a valid program from the sidebar.
            <div className="mt-2">
              <Link href={`/programs/${category.id}`} className="text-primary underline">
                Go back to {category.name} programs
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/programs">Programs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/programs/${category.id}`}>
              {category.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/programs/${category.id}/${selectedSubcategory.id}`}>
              {selectedSubcategory.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{selectedSubcategory.name}</h1>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="universities">Universities</TabsTrigger>
          <TabsTrigger value="admission">Admission Requirements</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Bachelor's: 4 years</p>
                <p className="text-sm text-muted-foreground">Master's: 2-3 years</p>
                <p className="text-sm text-muted-foreground">Doctoral: 3-5 years</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Intake Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Fall Semester: September</p>
                <p className="text-sm text-muted-foreground">Spring Semester: February/March</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Career Prospects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">High demand in job market</p>
                <p className="text-sm text-muted-foreground">Strong salary potential</p>
                <p className="text-sm text-muted-foreground">International career opportunities</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="prose max-w-none dark:prose-invert">
            <h2>About {selectedSubcategory.name} Programs</h2>
            <p>
              {selectedSubcategory.name} programs in Chinese universities offer comprehensive education
              in theoretical and practical aspects of the field. These programs are designed to equip
              students with the knowledge and skills necessary to succeed in today's competitive global
              environment.
            </p>
            
            <h3>Program Structure</h3>
            <p>
              Most {selectedSubcategory.name} programs follow a structured curriculum that includes:
            </p>
            
            <ul>
              <li>Core theoretical courses</li>
              <li>Practical laboratory work and projects</li>
              <li>Research methodology</li>
              <li>Industry internships</li>
              <li>Thesis or capstone projects</li>
            </ul>
            
            <h3>Language of Instruction</h3>
            <p>
              Programs are available in both Chinese and English medium, with some universities offering
              bilingual programs. International students often have the option to take Chinese language
              courses alongside their main studies.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="universities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sampleUniversities.map((university) => (
              <Card key={university.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-primary" />
                    {university.name}
                  </CardTitle>
                  <CardDescription>
                    {university.rank} • {university.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Tuition: {university.tuition}</p>
                    <p>Application Deadline: {university.deadline}</p>
                    <p>Programs: {university.programs.join(", ")}</p>
                    <p>Languages: {university.languages.join(", ")}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View University Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="admission" className="space-y-6">
          <div className="prose max-w-none dark:prose-invert">
            <h2>Admission Requirements</h2>
            
            <h3>Bachelor's Programs</h3>
            <ul>
              <li>High school diploma or equivalent</li>
              <li>Academic transcripts</li>
              <li>English proficiency test scores (IELTS/TOEFL)</li>
              <li>Chinese proficiency test scores (HSK) for Chinese-taught programs</li>
              <li>Letters of recommendation</li>
              <li>Personal statement</li>
            </ul>
            
            <h3>Master's Programs</h3>
            <ul>
              <li>Bachelor's degree in related field</li>
              <li>Academic transcripts</li>
              <li>Higher English proficiency requirements</li>
              <li>Research proposal (for research programs)</li>
              <li>Work experience (for some programs)</li>
              <li>GRE/GMAT scores (for some programs)</li>
            </ul>
            
            <h3>Doctoral Programs</h3>
            <ul>
              <li>Master's degree in related field</li>
              <li>Research proposal</li>
              <li>Publications or research experience</li>
              <li>Academic references</li>
              <li>Interview with potential supervisor</li>
            </ul>
            
            <h3>Required Documents</h3>
            <ul>
              <li>Passport copy</li>
              <li>Passport-size photos</li>
              <li>Physical examination form</li>
              <li>Non-criminal record certificate</li>
              <li>Financial statement</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="scholarships" className="space-y-6">
          <div className="prose max-w-none dark:prose-invert">
            <h2>Available Scholarships</h2>
            
            <h3>Chinese Government Scholarship (CGS)</h3>
            <p>
              Full scholarship covering tuition, accommodation, living allowance, and medical insurance.
              Available for Bachelor's, Master's, and Doctoral students.
            </p>
            <ul>
              <li>Application Deadline: Usually January-April</li>
              <li>Coverage: Full tuition, accommodation, stipend</li>
              <li>Duration: Full length of program</li>
            </ul>
            
            <h3>Confucius Institute Scholarship</h3>
            <p>
              Focused on Chinese language studies and cultural programs. Available for various durations
              from one semester to full degree programs.
            </p>
            <ul>
              <li>Application Deadline: Rolling basis</li>
              <li>Coverage: Tuition, accommodation, stipend</li>
              <li>Duration: 6 months to 4 years</li>
            </ul>
            
            <h3>University-Specific Scholarships</h3>
            <p>
              Many universities offer their own scholarships for international students:
            </p>
            <ul>
              <li>Merit-based scholarships</li>
              <li>Need-based grants</li>
              <li>Research assistantships</li>
              <li>Teaching assistantships</li>
              <li>Athletic scholarships</li>
            </ul>
            
            <h3>Application Requirements</h3>
            <ul>
              <li>Academic excellence</li>
              <li>Language proficiency</li>
              <li>Letters of recommendation</li>
              <li>Research proposal (for graduate programs)</li>
              <li>Statement of purpose</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Ready to Apply?</h2>
        <div className="flex flex-wrap gap-4">
          <Button>
            Start Application
          </Button>
          <Button variant="outline">
            Request Information
          </Button>
          <Button variant="ghost">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  );
} 