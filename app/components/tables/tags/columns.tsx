import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "../shared/SortableHeader";
import { TagRow } from "@/app/admin/tags/lib/utils";
import { Tag } from "@/app/admin/tags/lib/tag-service";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { formatDate } from "@/lib/utils/formatting";

// Standardized interface for column props
export interface TagColumnsProps {
  onEdit?: (tag: Tag) => void;
  onDelete?: (tagId: string) => void;
  onToggleActive?: (tagId: string, active: boolean) => void;
  onView?: (tagId: string) => void;
}

export function getTagColumns({
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: TagColumnsProps): ColumnDef<TagRow, any>[] {
  const columnHelper = createColumnHelper<TagRow>();

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
    
    // Name column
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Name" align="left" />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    
    // Category column
    columnHelper.accessor("category", {
      header: ({ column }) => <SortableHeader column={column} title="Category" align="center" />,
      cell: (info) => (
        <div className="text-center">
          <Badge variant="outline">{info.getValue()}</Badge>
        </div>
      ),
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
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const tag = info.getValue();
        
        return (
          <TableActionButtons
            id={tag.id}
            name={tag.name}
            onEdit={
              onEdit 
                ? () => onEdit({
                    _id: tag.id,
                    name: tag.name,
                    category: tag.category,
                    active: tag.active,
                    createdAt: tag.createdAt.toString(),
                    updatedAt: new Date().toString(),
                  })
                : undefined
            }
            onDelete={onDelete ? (id) => onDelete(id) : undefined}
            onToggleActive={onToggleActive ? (id, active) => onToggleActive(id, active) : undefined}
            isActive={tag.active}
            onView={onView ? (id) => onView(id) : undefined}
          />
        );
      },
      enableSorting: false,
    }),
  ];
} 