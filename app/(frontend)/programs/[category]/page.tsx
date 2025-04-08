"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { programCategories, type ProgramCategory, type ProgramSubcategory } from "@/app/components/layout/program-categories-sidebar";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const categories = Array.from(programCategories);
  
  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );
  
  if (!selectedCategory) {
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
  
  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/programs">Programs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/programs/${selectedCategory.id}`}>
              {selectedCategory.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{selectedCategory.name} Programs</h1>
      </div>
      
      <p className="text-muted-foreground max-w-3xl">
        {selectedCategory.description} Explore our {selectedCategory.name.toLowerCase()} programs 
        and majors offered by top Chinese universities. Select a specific program to learn more 
        about admission requirements, curriculum, and career prospects.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {selectedCategory.subcategories.map((subcategory) => (
          <Card key={subcategory.id} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {subcategory.name}
              </CardTitle>
              <CardDescription>
                Bachelor's, Master's and Doctoral programs available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn about admission requirements, tuition fees, scholarships, and more for{" "}
                {subcategory.name} programs at Chinese universities.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href={`/programs/${selectedCategory.id}/${subcategory.id}`} 
                className="text-sm text-primary flex items-center group-hover:underline"
              >
                View {subcategory.name} Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 