"use client";

import { LayoutGrid } from "lucide-react";
import { StudyOffer } from "@/app/admin/types";
import { BaseTanStackTable } from "./shared/BaseTanStackTable";
import { getOfferColumns } from "./offers/columns";

interface TanStackOffersTableProps {
  data: StudyOffer[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onSelectionChange?: (selectedRows: StudyOffer[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  deletingId?: string | null;
}

export function TanStackOffersTable({
  data = [],
  isLoading = false,
  isError = false,
  error,
  onEdit,
  onDelete,
  onView,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
  deletingId
}: TanStackOffersTableProps) {
  // Get column definitions
  const columns = getOfferColumns({
    onEdit,
    onDelete,
    onView,
    deletingId
  });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="offers"
      itemsName="offers"
      emptyIcon={LayoutGrid}
      emptyTitle="No study offers found"
      emptyDescription="Add your first offer to get started."
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