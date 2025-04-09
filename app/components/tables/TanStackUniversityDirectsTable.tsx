"use client";

import { Building } from "lucide-react";
import { UniversityDirect } from "@/app/admin/university-directs/hooks/useUniversityDirectsQuery";
import { BaseTanStackTable } from "./shared/BaseTanStackTable";
import { getUniversityDirectColumns } from "./university-directs/columns";

interface TanStackUniversityDirectsTableProps {
  data: UniversityDirect[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void; 
  onSelectionChange?: (selectedRows: UniversityDirect[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function TanStackUniversityDirectsTable({
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
}: TanStackUniversityDirectsTableProps) {
  // Get column definitions
  const columns = getUniversityDirectColumns({
    onEdit,
    onDelete,
    onToggleActive,
  });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="university-directs"
      itemsName="contacts"
      emptyIcon={Building}
      emptyTitle="No university direct contacts found"
      emptyDescription="Try adjusting your search or add a new university direct contact."
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