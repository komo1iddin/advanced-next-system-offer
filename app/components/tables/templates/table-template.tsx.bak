/**
 * Template for creating standardized table components
 * Copy this file when creating a table for a new entity type
 */

"use client";

// Import an appropriate icon from lucide-react
// import { Users } from "lucide-react"; // Example: For users/people tables
// import { Tag } from "lucide-react"; // Example: For tag tables
// import { School } from "lucide-react"; // Example: For university tables

import { BaseTanStackTable } from "../shared/BaseTanStackTable";
// Import your entity-specific columns:
// import { getEntityColumns } from "../entity/columns";

// Define your entity type
interface EntityType {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  // Add other fields as needed
}

// Standardized props interface
interface TanStackEntityTableProps {
  data: EntityType[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onSelectionChange?: (selectedRows: EntityType[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function TanStackEntityTable({
  data = [],
  isLoading = false,
  isError = false,
  error,
  onToggleActive,
  onEdit,
  onDelete,
  onView,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
}: TanStackEntityTableProps) {
  // Get column definitions
  const columns = [] as any[]; // Replace with: getEntityColumns({ onEdit, onDelete, onToggleActive, onView });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="entity" // Update with your entity name
      itemsName="entities" // Update with your entity name (plural)
      // emptyIcon={YourEntityIcon} // Uncomment and replace with appropriate icon
      emptyTitle="No entities found" // Update with your entity name
      emptyDescription="Add your first entity to get started." // Update as needed
      isLoading={isLoading}
      isError={isError}
      error={error}
      refetch={refetch}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      onSelectionChange={onSelectionChange}
    />
  );
} 