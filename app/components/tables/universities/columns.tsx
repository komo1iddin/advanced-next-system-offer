"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { University } from "@/app/admin/universities/hooks/useUniversitiesQuery";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, School } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SortableHeader } from "../shared/SortableHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UniversityColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
}

export function getUniversityColumns({
  onEdit,
  onDelete,
  onToggleActive,
}: UniversityColumnsProps): ColumnDef<University, any>[] {
  const columnHelper = createColumnHelper<University>();

  return [
    {
      id: "select",
      header: ({ table }: any) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.location.city, {
      id: "city",
      header: ({ column }) => <SortableHeader column={column} title="City" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.location.province, {
      id: "province",
      header: ({ column }) => <SortableHeader column={column} title="Province" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("localRanking", {
      header: ({ column }) => <SortableHeader column={column} title="Local Ranking" />,
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("worldRanking", {
      header: ({ column }) => <SortableHeader column={column} title="World Ranking" />,
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("active", {
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: (info) => {
        const isActive = info.getValue();
        return onToggleActive ? (
          <div className="flex items-center">
            <Switch
              checked={isActive}
              onCheckedChange={() => 
                onToggleActive(info.row.original.id, !isActive)
              }
            />
            <span className="ml-2">{isActive ? "Active" : "Inactive"}</span>
          </div>
        ) : (
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs ${
              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const university = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit && onEdit(university.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete University</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {university.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => onDelete && onDelete(university.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    }),
  ];
} 