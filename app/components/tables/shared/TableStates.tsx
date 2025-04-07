"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { LucideIcon } from "lucide-react";

interface TableLoadingStateProps<TData> {
  columns: ColumnDef<TData, any>[];
  message?: string;
}

export function TableLoadingState<TData>({
  columns,
  message = "Loading data...",
}: TableLoadingStateProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, idx) => (
              <TableHead key={idx}>
                {typeof column.header === "string" ? column.header : ""}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <div className="flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2">{message}</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

interface TableErrorStateProps<TData> {
  columns: ColumnDef<TData, any>[];
  message?: string;
  retryMessage?: string;
  onRetry?: () => void;
}

export function TableErrorState<TData>({
  columns,
  message = "Failed to load data",
  retryMessage = "Try again",
  onRetry,
}: TableErrorStateProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, idx) => (
              <TableHead key={idx}>
                {typeof column.header === "string" ? column.header : ""}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
              <div className="flex flex-col items-center justify-center">
                <span>{message}</span>
                {onRetry && (
                  <Button 
                    onClick={onRetry} 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                  >
                    {retryMessage}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

interface TableEmptyStateProps<TData> {
  headerGroups: any[];
  colSpan?: number;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function TableEmptyState<TData>({
  headerGroups,
  colSpan,
  icon: Icon,
  title = "No data found",
  description = "Try adjusting your search or filters.",
  action,
}: TableEmptyStateProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
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
          <TableRow>
            <TableCell colSpan={colSpan || headerGroups[0]?.headers.length || 1} className="h-24 text-center">
              {Icon && <Icon className="mx-auto h-12 w-12 text-muted-foreground/50" />}
              <p className="mt-2 text-lg font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
              {action && <div className="mt-4">{action}</div>}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
} 