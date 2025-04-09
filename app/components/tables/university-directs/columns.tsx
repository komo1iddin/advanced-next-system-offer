"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { UniversityDirect } from "@/app/admin/university-directs/hooks/useUniversityDirectsQuery";
import { UserPlus } from "lucide-react";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { ContactMethods } from "./ContactMethods";

// Standardized interface for column props
export interface UniversityDirectColumnsProps {
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
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        <div className="text-center">
          <TableSelectionCheckbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            label="Select all rows"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <TableSelectionCheckbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    
    // University Name column
    columnHelper.accessor("universityName", {
      header: ({ column }) => <SortableHeader column={column} title="University" align="left" />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    
    // Department Name column
    columnHelper.accessor("departmentName", {
      header: ({ column }) => <SortableHeader column={column} title="Department" align="left" />,
      cell: (info) => info.getValue() || "-",
    }),
    
    // Contact Person column
    columnHelper.accessor("contactPersonName", {
      header: ({ column }) => <SortableHeader column={column} title="Contact Person" align="left" />,
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
    
    // Contact Methods column
    columnHelper.display({
      id: "contactMethods",
      header: ({ column }) => <SortableHeader column={column} title="Contact Methods" align="center" />,
      cell: (info) => <div className="text-center"><ContactMethods universityDirect={info.row.original} /></div>,
    }),
    
    // Status column
    columnHelper.accessor("active", {
      header: ({ column }) => <SortableHeader column={column} title="Status" align="center" />,
      cell: (info) => {
        const isActive = info.getValue();
        return (
          <div className="text-center">
            <TableStatusToggle isActive={isActive} />
          </div>
        );
      },
    }),
    
    // Actions column
    columnHelper.accessor("_id", {
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const id = info.getValue();
        const universityDirect = info.row.original;
        
        return (
          <TableActionButtons
            id={id}
            name={`${universityDirect.universityName} - ${universityDirect.contactPersonName || 'Direct Contact'}`}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            isActive={universityDirect.active}
          />
        );
      },
      enableSorting: false,
    }),
  ];
} 