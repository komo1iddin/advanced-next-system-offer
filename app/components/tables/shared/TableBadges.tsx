"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * A badge component for displaying active/inactive status
 */
export function StatusBadge({ 
  active, 
  label = "" 
}: { 
  active: boolean; 
  label?: string;
}) {
  return (
    <Badge 
      variant={active ? "default" : "secondary"}
      className={cn(
        active ? "bg-green-500 hover:bg-green-600" : "",
      )}
    >
      {label || (active ? "Active" : "Inactive")}
    </Badge>
  );
}

/**
 * A badge component for displaying entity types with appropriate colors
 */
export function TypeBadge({ 
  type, 
  label 
}: { 
  type: string; 
  label: string;
}) {
  const colorMap: Record<string, string> = {
    province: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    city: "bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200",
    university: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
    agent: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
    student: "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200",
    offer: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
    default: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
  };

  const colorClass = colorMap[type] || colorMap.default;

  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass)}
    >
      {label}
    </Badge>
  );
} 