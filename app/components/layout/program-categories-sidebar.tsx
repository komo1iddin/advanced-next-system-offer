"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, GraduationCap, BookOpen } from "lucide-react";

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Define interfaces for our data
export interface ProgramSubcategory {
  id: string;
  name: string;
}

export interface ProgramCategory {
  id: string;
  name: string;
  description: string;
  subcategories: ProgramSubcategory[];
}

// Program categories data - replace with actual data from your API or database
export const programCategories = [
  {
    id: "economics",
    name: "Economics",
    description: "Study of production, distribution, and consumption of goods and services.",
    subcategories: [
      { id: "economics-general", name: "Economics" },
      { id: "economic-statistics", name: "Economic Statistics" },
      { id: "business-economics", name: "Business Economics" },
      { id: "digital-economy", name: "Digital Economy" },
      { id: "finance", name: "Finance" },
      { id: "financial-mathematics", name: "Financial Mathematics" },
      { id: "financial-engineering", name: "Financial Engineering" }
    ]
  },
  {
    id: "management",
    name: "Management",
    description: "Study of organization leadership and administration of resources.",
    subcategories: [
      { id: "business-administration", name: "Business Administration" },
      { id: "marketing", name: "Marketing" },
      { id: "human-resource", name: "Human Resource Management" },
      { id: "logistics", name: "Logistics" },
      { id: "project-management", name: "Project Management" }
    ]
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Application of scientific principles to design and build machines, structures, and systems.",
    subcategories: [
      { id: "civil-engineering", name: "Civil Engineering" },
      { id: "electrical-engineering", name: "Electrical Engineering" },
      { id: "mechanical-engineering", name: "Mechanical Engineering" },
      { id: "computer-engineering", name: "Computer Engineering" },
      { id: "chemical-engineering", name: "Chemical Engineering" }
    ]
  },
  {
    id: "science",
    name: "Science",
    description: "Systematic study of the structure and behavior of the physical and natural world.",
    subcategories: [
      { id: "physics", name: "Physics" },
      { id: "chemistry", name: "Chemistry" },
      { id: "biology", name: "Biology" },
      { id: "mathematics", name: "Mathematics" },
      { id: "computer-science", name: "Computer Science" }
    ]
  },
  {
    id: "medicine",
    name: "Medicine",
    description: "Science and practice of the diagnosis, treatment, and prevention of disease.",
    subcategories: [
      { id: "clinical-medicine", name: "Clinical Medicine" },
      { id: "pharmacy", name: "Pharmacy" },
      { id: "nursing", name: "Nursing" },
      { id: "dentistry", name: "Dentistry" },
      { id: "public-health", name: "Public Health" }
    ]
  },
  {
    id: "languages",
    name: "Languages",
    description: "Study of human communication through linguistic systems.",
    subcategories: [
      { id: "chinese-language", name: "Chinese Language" },
      { id: "english", name: "English" },
      { id: "linguistics", name: "Linguistics" },
      { id: "translation", name: "Translation & Interpretation" }
    ]
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    description: "Study of human culture, expression, and social contexts.",
    subcategories: [
      { id: "literature", name: "Literature" },
      { id: "history", name: "History" },
      { id: "philosophy", name: "Philosophy" },
      { id: "fine-arts", name: "Fine Arts" },
      { id: "performing-arts", name: "Performing Arts" }
    ]
  },
  {
    id: "law",
    name: "Legal Studies",
    description: "Study of legal systems, laws, and their applications.",
    subcategories: [
      { id: "international-law", name: "International Law" },
      { id: "business-law", name: "Business Law" },
      { id: "criminal-law", name: "Criminal Law" },
      { id: "civil-law", name: "Civil Law" }
    ]
  }
] as const;

export function ProgramCategoriesSidebar() {
  const pathname = usePathname();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const isActiveCategory = (categoryId: string) => {
    return pathname.includes(`/programs/${categoryId}`);
  };

  const isActiveSubcategory = (categoryId: string, subcategoryId: string) => {
    return pathname === `/programs/${categoryId}/${subcategoryId}`;
  };

  return (
    <nav className="space-y-2 px-2">
      <div className="flex items-center gap-2 py-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Programs & Majors</h2>
      </div>
      <div className="space-y-1">
        {programCategories.map((category) => (
          <div key={category.id} className="space-y-1">
            <button
              onClick={() => toggleCategory(category.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                isActiveCategory(category.id) ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{category.name}</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  expandedCategory === category.id ? "rotate-90" : ""
                }`}
              />
            </button>
            {expandedCategory === category.id && (
              <div className="pl-6 pt-1">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/programs/${category.id}/${subcategory.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                      isActiveSubcategory(category.id, subcategory.id)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
} 