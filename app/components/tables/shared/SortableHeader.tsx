"use client";

import { Button } from "@/components/ui/button";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export function SortableHeader<TData, TValue>({
  column,
  title,
  className,
  align = "left",
}: SortableHeaderProps<TData, TValue>) {
  // Default alignment classes
  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={`flex items-center w-full ${alignmentClass} ${className || ""}`}
    >
      {title}
      <span className="ml-2">
        {{
          asc: <ChevronUp className="h-4 w-4" />,
          desc: <ChevronDown className="h-4 w-4" />,
          false: <ArrowUpDown className="h-4 w-4 opacity-50" />,
        }[column.getIsSorted() as string] ?? <ArrowUpDown className="h-4 w-4 opacity-50" />}
      </span>
    </Button>
  );
} 