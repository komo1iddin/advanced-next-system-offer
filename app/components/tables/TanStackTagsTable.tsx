"use client";

import { Tag as TagIcon } from "lucide-react";
import { TagRow } from "@/app/admin/tags/lib/utils";
import { Tag } from "@/app/admin/tags/lib/tag-service";
import { BaseTanStackTable } from "./shared/BaseTanStackTable";
import { getTagColumns } from "./tags/columns";

interface TanStackTagsTableProps {
  data: TagRow[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (tag: Tag) => void;
  onDelete?: (id: string) => void; 
  onSelectionChange?: (selectedRows: TagRow[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function TanStackTagsTable({
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
}: TanStackTagsTableProps) {
  // Get column definitions
  const columns = getTagColumns({
    onEdit,
    onDelete,
    onToggleActive,
  });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="tags"
      itemsName="tags"
      emptyIcon={TagIcon}
      emptyTitle="No tags found"
      emptyDescription="Add your first tag to get started."
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