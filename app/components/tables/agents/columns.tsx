"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Agent } from "@/app/admin/agents/hooks/useAgentsQuery";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";

// Format date helper function
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return dateString || "—";
  }
};

interface GetAgentColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
}

const columnHelper = createColumnHelper<Agent>();

export function getAgentColumns({
  onEdit,
  onDelete,
  onToggleActive,
}: GetAgentColumnsProps): ColumnDef<Agent, any>[] {
  return [
    // Selection column
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),

    // Name column
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <div className="font-medium">{info.getValue()}</div>,
    }),

    // Email column
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => <div>{info.getValue() || "—"}</div>,
    }),

    // Website column (instead of phone which seems to be missing in the Agent type)
    columnHelper.accessor("website", {
      header: "Website",
      cell: (info) => <div>{info.getValue() || "—"}</div>,
    }),

    // Status column
    columnHelper.accessor("active", {
      header: "Status",
      cell: (info) => (
        <Badge
          className={info.getValue() ? "bg-green-500 hover:bg-green-600" : ""}
          variant={info.getValue() ? "default" : "secondary"}
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),

    // Created At column
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => formatDate(info.getValue()),
    }),

    // Actions column
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const agent = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(agent._id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {onToggleActive && (
                <DropdownMenuItem 
                  onClick={() => onToggleActive(agent._id, !agent.active)}
                >
                  {agent.active ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(agent._id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];
} 