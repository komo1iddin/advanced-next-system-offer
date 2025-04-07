import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "../shared/SortableHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TagRow } from "@/app/admin/tags/lib/utils";
import { Tag } from "@/app/admin/tags/lib/tag-service";

// Helper function to format date
const formatDate = (dateString: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateString);
};

export interface TagColumnsProps {
  onEdit?: (tag: Tag) => void;
  onDelete?: (tagId: string) => void;
  onToggleActive?: (tagId: string, active: boolean) => void;
}

export function getTagColumns({
  onEdit,
  onDelete,
  onToggleActive,
}: TagColumnsProps): ColumnDef<TagRow, any>[] {
  const columnHelper = createColumnHelper<TagRow>();

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
    columnHelper.accessor("category", {
      header: ({ column }) => <SortableHeader column={column} title="Category" />,
      cell: (info) => (
        <Badge variant="outline">{info.getValue()}</Badge>
      ),
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
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Created" />,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: "",
      cell: (info) => {
        const tag = info.getValue();
        return (
          <div className="flex justify-end space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const originalTag: Tag = {
                    _id: tag.id,
                    name: tag.name,
                    category: tag.category,
                    active: tag.active,
                    createdAt: tag.createdAt.toString(),
                    updatedAt: new Date().toString(),
                  };
                  onEdit(originalTag);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
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
                    <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the tag "{tag.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => onDelete(tag.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        );
      },
      enableSorting: false,
    }),
  ];
} 