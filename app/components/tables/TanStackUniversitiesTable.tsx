"use client";

import { School } from "lucide-react";
import { University } from "@/app/admin/universities/hooks/useUniversitiesQuery";
import { BaseTanStackTable } from "./shared/BaseTanStackTable";
import { getUniversityColumns } from "./universities/columns";

interface TanStackUniversitiesTableProps {
  data: University[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void; 
  onSelectionChange?: (selectedRows: University[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function TanStackUniversitiesTable({
  data = [],
  isLoading = false,
  isError = false,
  error,
  onToggleActive,
  onEdit,
  onDelete,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
}: TanStackUniversitiesTableProps) {
  // Get column definitions
  const columns = getUniversityColumns({
    onEdit,
    onDelete,
    onToggleActive,
  });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="universities"
      itemsName="universities"
      emptyIcon={School}
      emptyTitle="No universities found"
      emptyDescription="Try adjusting your search or add a new university."
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