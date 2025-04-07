"use client";

import { useState, useEffect } from "react";
import {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { UniversityDirect } from "@/app/admin/university-directs/hooks/useUniversityDirectsQuery";
import { Building } from "lucide-react";

// Import UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";

// Import shared components
import { usePersistentTableState } from "@/app/hooks/usePersistentTableState";
import { TablePagination } from "./shared/TablePagination";
import { TableLoadingState, TableErrorState, TableEmptyState } from "./shared/TableStates";
import { getUniversityDirectColumns } from "./university-directs/columns";

interface TanStackUniversityDirectsTableProps {
  data: UniversityDirect[];
  isLoading?: boolean;
  isError?: boolean;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void; 
  onSelectionChange?: (selectedRows: UniversityDirect[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function TanStackUniversityDirectsTable({
  data: universityDirects = [],
  isLoading = false,
  isError = false,
  onToggleActive,
  onEdit,
  onDelete,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
}: TanStackUniversityDirectsTableProps) {
  // Table state
  const [sorting, setSorting] = usePersistentTableState<SortingState>("university-directs-sorting", []);
  const [columnFilters, setColumnFilters] = usePersistentTableState<ColumnFiltersState>("university-directs-filters", []);
  const [pagination, setPagination] = usePersistentTableState<PaginationState>("university-directs-pagination", {
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  // Get column definitions
  const columns = getUniversityDirectColumns({
    onEdit,
    onDelete,
    onToggleActive,
  });

  // Initialize table
  const table = useReactTable({
    data: universityDirects,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    debugTable: process.env.NODE_ENV === "development",
  });

  // Pass selected rows to parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onSelectionChange]);

  // State handling
  if (isLoading) {
    return <TableLoadingState columns={columns} message="Loading university direct contacts..." />;
  }

  if (isError) {
    return (
      <TableErrorState 
        columns={columns} 
        message="Failed to load university direct contacts"
        onRetry={refetch}
      />
    );
  }

  if (universityDirects.length === 0) {
    return (
      <TableEmptyState
        headerGroups={table.getHeaderGroups()}
        icon={Building}
        title="No university direct contacts found"
        description="Try adjusting your search or add a new university direct contact."
      />
    );
  }

  // Render the standard table
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} itemsName="contacts" />
    </div>
  );
} 