"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { UniversityDirect } from "@/app/admin/university-directs/hooks/useUniversityDirectsQuery";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ContactMethods } from "./ContactMethods";
import { SortableHeader } from "../shared/SortableHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UniversityDirectColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
}

export function getUniversityDirectColumns({
  onEdit,
  onDelete,
  onToggleActive,
}: UniversityDirectColumnsProps): ColumnDef<UniversityDirect, any>[] {
  const columnHelper = createColumnHelper<UniversityDirect>();

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
    columnHelper.accessor("universityName", {
      header: ({ column }) => <SortableHeader column={column} title="University" />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("departmentName", {
      header: ({ column }) => <SortableHeader column={column} title="Department" />,
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("contactPersonName", {
      header: ({ column }) => <SortableHeader column={column} title="Contact Person" />,
      cell: (info) => {
        const contactPersonName = info.getValue();
        const universityDirect = info.row.original;
        
        return contactPersonName ? (
          <div className="flex items-center gap-1">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span>{contactPersonName}</span>
            {universityDirect.position && (
              <span className="text-muted-foreground">
                ({universityDirect.position})
              </span>
            )}
          </div>
        ) : (
          "-"
        )
      },
    }),
    columnHelper.display({
      id: "contactMethods",
      header: "Contact Methods",
      cell: (info) => <ContactMethods universityDirect={info.row.original} />,
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
                onToggleActive(info.row.original._id, !isActive)
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
        const universityDirect = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit && onEdit(universityDirect._id)}
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
                  <AlertDialogTitle>Delete University Direct</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this university direct contact? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => onDelete && onDelete(universityDirect._id)}
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