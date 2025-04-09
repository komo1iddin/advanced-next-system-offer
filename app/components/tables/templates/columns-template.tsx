/**
 * Template for creating standardized table column definitions
 * Copy this file when creating columns for a new entity type
 */

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { formatDate, formatNullable, formatPrice } from "@/lib/utils/formatting";
import { Badge } from "@/components/ui/badge";

// Define your entity type
interface EntityType {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  // Add other fields as needed
}

// Standardized interface for column props
export interface EntityColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  onView?: (id: string) => void;
}

export function getEntityColumns({
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: EntityColumnsProps): ColumnDef<EntityType, any>[] {
  const columnHelper = createColumnHelper<EntityType>();

  return [
    // Selection column
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <TableSelectionCheckbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <TableSelectionCheckbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),

    // Name column
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),

    // Status column (display only)
    columnHelper.accessor("active", {
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: (info) => (
        <TableStatusToggle
          isActive={info.getValue()}
        />
      ),
    }),

    // Created At column
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Created" />,
      cell: (info) => formatDate(info.getValue()),
    }),

    // Actions column
    columnHelper.display({
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" />,
      cell: ({ row }) => {
        const entity = row.original;
        
        return (
          <TableActionButtons
            id={entity.id}
            name={entity.name}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            isActive={entity.active}
            onView={onView}
          />
        );
      },
    }),
  ];
} 