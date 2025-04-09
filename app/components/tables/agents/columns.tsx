"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Agent } from "@/app/admin/agents/hooks/useAgentsQuery";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { formatDate, formatNullable } from "../shared/FormatUtils";

// Standardized interface for column props
export interface AgentColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  onView?: (id: string) => void;
}

const columnHelper = createColumnHelper<Agent>();

export function getAgentColumns({
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: AgentColumnsProps): ColumnDef<Agent, any>[] {
  return [
    // Selection column
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="text-center">
          <TableSelectionCheckbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            label="Select all"
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
    }),

    // Name column
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Name" align="left" />,
      cell: (info) => <div className="font-medium">{info.getValue()}</div>,
    }),

    // Email column
    columnHelper.accessor("email", {
      header: ({ column }) => <SortableHeader column={column} title="Email" align="left" />,
      cell: (info) => <div>{formatNullable(info.getValue())}</div>,
    }),

    // Website column
    columnHelper.accessor("website", {
      header: ({ column }) => <SortableHeader column={column} title="Website" align="left" />,
      cell: (info) => <div>{formatNullable(info.getValue())}</div>,
    }),

    // Status column (display only)
    columnHelper.accessor("active", {
      header: ({ column }) => <SortableHeader column={column} title="Status" align="center" />,
      cell: (info) => (
        <div className="text-center">
          <TableStatusToggle
            isActive={info.getValue()}
          />
        </div>
      ),
    }),

    // Created At column
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Created" align="center" />,
      cell: (info) => <div className="text-center">{formatDate(info.getValue())}</div>,
    }),

    // Actions column
    columnHelper.display({
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: ({ row }) => {
        const agent = row.original;
        
        return (
          <TableActionButtons
            id={agent._id}
            name={agent.name}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            isActive={agent.active}
            onView={onView}
          />
        );
      },
    }),
  ];
} 