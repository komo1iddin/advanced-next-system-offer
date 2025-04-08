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
import { LocationRow } from "@/app/admin/locations/lib/utils";
import { Province, City } from "@/app/admin/locations/lib/location-service";
import { MapPin } from "lucide-react";

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
import { usePersistentTableState } from "@/hooks/use-persistent-table-state";
import { TablePagination } from "./shared/TablePagination";
import { TableLoadingState, TableErrorState, TableEmptyState } from "./shared/TableStates";
import { getLocationColumns } from "./locations/columns";

interface TanStackLocationsTableProps {
  data: LocationRow[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEditProvince?: (province: Province) => void;
  onEditCity?: (city: City) => void;
  onDeleteProvince?: (provinceId: string) => void;
  onDeleteCity?: (cityId: string) => void;
  onToggleActive?: (id: string, type: 'province' | 'city', active: boolean) => void;
  onSelectionChange?: (selectedRows: LocationRow[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  provinces: Province[];
  cities: City[];
}

export function TanStackLocationsTable({
  data: locations = [],
  isLoading = false,
  isError = false,
  error,
  onEditProvince,
  onEditCity,
  onDeleteProvince,
  onDeleteCity,
  onToggleActive,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
  provinces,
  cities
}: TanStackLocationsTableProps) {
  // Table state
  const [sorting, setSorting] = usePersistentTableState<SortingState>("locations-sorting", []);
  const [columnFilters, setColumnFilters] = usePersistentTableState<ColumnFiltersState>("locations-filters", []);
  const [pagination, setPagination] = usePersistentTableState<PaginationState>("locations-pagination", {
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  // Get column definitions
  const columns = getLocationColumns({
    onEditProvince,
    onEditCity,
    onDeleteProvince,
    onDeleteCity,
    onToggleActive,
    provinces,
    cities
  });

  // Initialize table
  const table = useReactTable({
    data: locations,
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
    return <TableLoadingState columns={columns} message="Loading locations..." />;
  }

  if (isError) {
    return (
      <TableErrorState 
        columns={columns} 
        message={`Failed to load locations: ${error instanceof Error ? error.message : 'Unknown error'}`}
        onRetry={refetch}
      />
    );
  }

  if (locations.length === 0) {
    return (
      <TableEmptyState
        headerGroups={table.getHeaderGroups()}
        icon={MapPin}
        title="No locations found"
        description="Use the 'Add Province' or 'Add City' buttons to create locations."
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

      <TablePagination table={table} itemsName="locations" />
    </div>
  );
} 