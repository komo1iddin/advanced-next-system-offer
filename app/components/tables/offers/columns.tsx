import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "../shared/SortableHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { StudyOffer } from "../OffersTable";

export interface OfferColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  deletingId?: string | null;
}

export function getOfferColumns({
  onEdit,
  onDelete,
  onView,
  deletingId
}: OfferColumnsProps): ColumnDef<StudyOffer, any>[] {
  const columnHelper = createColumnHelper<StudyOffer>();

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
    columnHelper.accessor("uniqueId", {
      header: ({ column }) => <SortableHeader column={column} title="ID" />,
      cell: (info) => (
        <span className="font-mono text-xs">
          {info.getValue() || "—"}
        </span>
      ),
    }),
    columnHelper.accessor("title", {
      header: ({ column }) => <SortableHeader column={column} title="Title" />,
      cell: (info) => {
        const offer = info.row.original;
        return (
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-muted-foreground md:hidden">
              {offer.universityName}, {offer.location}
            </div>
            {offer.featured && (
              <Badge className="mt-1 bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("universityName", {
      header: ({ column }) => <SortableHeader column={column} title="University" />,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("location", {
      header: ({ column }) => <SortableHeader column={column} title="Location" />,
      cell: (info) => info.getValue(),
      meta: {
        className: "hidden md:table-cell",
      },
    }),
    columnHelper.accessor("degreeLevel", {
      header: ({ column }) => <SortableHeader column={column} title="Degree" />,
      cell: (info) => info.getValue(),
      meta: {
        className: "hidden md:table-cell",
      },
    }),
    columnHelper.accessor((row) => `${row.tuitionFees.amount} ${row.tuitionFees.currency}/${row.tuitionFees.period}`, {
      id: "tuition",
      header: ({ column }) => <SortableHeader column={column} title="Tuition" />,
      cell: (info) => info.getValue(),
      meta: {
        className: "hidden md:table-cell",
      },
    }),
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: "",
      cell: (info) => {
        const offer = info.getValue();
        return (
          <div className="flex justify-end space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(offer._id)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    disabled={deletingId === offer._id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Study Offer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{offer.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => onDelete(offer._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {onView && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onView(offer._id)}
                title="View"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
    }),
  ];
} 