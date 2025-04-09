import { Badge } from "@/components/ui/badge";

export interface TableStatusToggleProps {
  isActive: boolean;
}

export function TableStatusToggle({
  isActive,
}: TableStatusToggleProps) {
  // Only render a status badge without any toggle functionality
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={isActive ? "bg-green-500 hover:bg-green-600" : ""}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
} 