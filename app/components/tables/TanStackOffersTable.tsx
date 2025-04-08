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
import { StudyOffer } from "@/app/admin/types";
import { LayoutGrid } from "lucide-react";

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
import { getOfferColumns } from "./offers/columns";

// Define column meta type
export type OfferColumnMeta = {
  className?: string;
};

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
  data: offers = [],
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
  // Table state
  const [sorting, setSorting] = usePersistentTableState<SortingState>("offers-sorting", []);
  const [columnFilters, setColumnFilters] = usePersistentTableState<ColumnFiltersState>("offers-filters", []);
  const [pagination, setPagination] = usePersistentTableState<PaginationState>("offers-pagination", {
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  // Get column definitions
  const columns = getOfferColumns({
    onEdit,
    onDelete,
    onView,
    deletingId
  });

  // Initialize table
  const table = useReactTable({
    data: offers,
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
    return <TableLoadingState columns={columns} message="Loading study offers..." />;
  }

  if (isError) {
    return (
      <TableErrorState 
        columns={columns} 
        message={`Failed to load study offers: ${error instanceof Error ? error.message : 'Unknown error'}`}
        onRetry={refetch}
      />
    );
  }

  if (offers.length === 0) {
    return (
      <TableEmptyState
        headerGroups={table.getHeaderGroups()}
        icon={LayoutGrid}
        title="No study offers found"
        description="Add your first offer to get started."
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
                  <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
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
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} itemsName="offers" />
    </div>
  );
} 