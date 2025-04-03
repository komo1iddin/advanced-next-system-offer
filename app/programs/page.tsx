import Link from "next/link";
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { programCategories, type ProgramCategory } from "@/components/program-categories-sidebar";

export default function ProgramsPage() {
  const categories = Array.from(programCategories);
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Academic Programs</h1>
      </div>
      
      <p className="text-muted-foreground max-w-3xl">
        Browse our comprehensive range of academic programs across various disciplines. 
        Choose a category from the sidebar to explore specific programs and majors 
        offered by top Chinese universities.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {category.name}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {category.subcategories.map((subcategory, index) => (
                  index < 3 && (
                    <li key={subcategory.id} className="text-sm text-muted-foreground">• {subcategory.name}</li>
                  )
                ))}
                {category.subcategories.length > 3 && (
                  <li className="text-sm text-muted-foreground">• And {category.subcategories.length - 3} more...</li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={`/programs/${category.id}`} className="text-sm text-primary flex items-center group-hover:underline">
                Explore {category.name} Programs
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 