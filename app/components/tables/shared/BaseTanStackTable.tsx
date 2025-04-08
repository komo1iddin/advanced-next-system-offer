"use client";

import { ReactNode, useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

// Import UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import shared components
import { usePersistentTableState } from "@/app/hooks/usePersistentTableState";
import { TablePagination } from "./TablePagination";
import { TableLoadingState, TableErrorState, TableEmptyState } from "./TableStates";

export interface BaseTanStackTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  stateKey: string;
  itemsName: string;
  emptyStateProps?: {
    icon: any;
    title: string;
    description: string;
  };
}

export function BaseTanStackTable<TData>({
  data = [],
  columns,
  isLoading = false,
  isError = false,
  error,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
  onSelectionChange,
  stateKey,
  itemsName,
  emptyStateProps,
}: BaseTanStackTableProps<TData>) {
  // Table state
  const [sorting, setSorting] = usePersistentTableState<SortingState>(`${stateKey}-sorting`, []);
  const [columnFilters, setColumnFilters] = usePersistentTableState<ColumnFiltersState>(`${stateKey}-filters`, []);
  const [pagination, setPagination] = usePersistentTableState<PaginationState>(`${stateKey}-pagination`, {
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  // Initialize table
  const table = useReactTable({
    data,
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
    return <TableLoadingState columns={columns} message={`Loading ${itemsName}...`} />;
  }

  if (isError) {
    return (
      <TableErrorState 
        columns={columns} 
        message={`Failed to load ${itemsName}: ${error instanceof Error ? error.message : 'Unknown error'}`}
        onRetry={refetch}
      />
    );
  }

  if (data.length === 0) {
    return (
      <TableEmptyState
        headerGroups={table.getHeaderGroups()}
        icon={emptyStateProps?.icon}
        title={emptyStateProps?.title || `No ${itemsName} found`}
        description={emptyStateProps?.description || `Try adjusting your search or add a new ${itemsName.endsWith('s') ? itemsName.slice(0, -1) : itemsName}.`}
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

      <TablePagination table={table} itemsName={itemsName} />
    </div>
  );
} 