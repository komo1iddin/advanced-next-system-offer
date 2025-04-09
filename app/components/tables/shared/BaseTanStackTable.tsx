"use client";

import { useState, useEffect, ReactNode } from "react";
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
  Table as TanStackTable,
  VisibilityState,
} from "@tanstack/react-table";
import { LucideIcon } from "lucide-react";

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
import { TablePagination } from "./TablePagination";
import { TableLoadingState, TableErrorState, TableEmptyState } from "./TableStates";

// Column metadata type
export type ColumnMeta = {
  className?: string;
  [key: string]: any;
};

interface BaseTanStackTableProps<TData> {
  // Table settings
  data: TData[];
  columns: ColumnDef<TData, any>[];
  tableId: string;  // Unique ID for persisting state - e.g., "offers", "agents", etc.
  itemsName: string; // Display name for items - e.g., "offers", "agents", etc.
  
  // Empty state
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  
  // Data state
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => void;
  
  // Filters
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  
  // Row selection
  onSelectionChange?: (selectedRows: TData[]) => void;
  enableRowSelection?: boolean;
  
  // Column visibility
  defaultColumnVisibility?: VisibilityState;
  
  // Additional styling
  tableClassName?: string;
  cellClassName?: (cell: any) => string | undefined;

  // Custom content
  topContent?: ReactNode;
  bottomContent?: ReactNode;
}

export function BaseTanStackTable<TData>({
  // Table settings
  data = [],
  columns,
  tableId,
  itemsName,
  
  // Empty state
  emptyIcon,
  emptyTitle,
  emptyDescription,
  
  // Data state
  isLoading = false,
  isError = false,
  error,
  refetch,
  
  // Filters
  globalFilter = "",
  onGlobalFilterChange,
  
  // Row selection
  onSelectionChange,
  enableRowSelection = true,
  
  // Column visibility
  defaultColumnVisibility,
  
  // Additional styling
  tableClassName,
  cellClassName,
  
  // Custom content
  topContent,
  bottomContent,
}: BaseTanStackTableProps<TData>) {
  // Table state
  const [sorting, setSorting] = usePersistentTableState<SortingState>(`${tableId}-sorting`, []);
  const [columnFilters, setColumnFilters] = usePersistentTableState<ColumnFiltersState>(`${tableId}-filters`, []);
  const [pagination, setPagination] = usePersistentTableState<PaginationState>(`${tableId}-pagination`, {
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility || {});
  
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
      columnVisibility,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
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
        icon={emptyIcon}
        title={emptyTitle || `No ${itemsName} found`}
        description={emptyDescription || `Try adjusting your search or add a new ${itemsName.slice(0, -1)}.`}
      />
    );
  }

  // Render the standard table
  return (
    <div className="space-y-4">
      {topContent}
    
      <div className={`rounded-md border ${tableClassName || ''}`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className={(header.column.columnDef.meta as ColumnMeta)?.className}
                  >
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
                  <TableCell 
                    key={cell.id} 
                    className={`${(cell.column.columnDef.meta as ColumnMeta)?.className || ''} ${cellClassName ? cellClassName(cell) : ''}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} itemsName={itemsName} />
      
      {bottomContent}
    </div>
  );
} 