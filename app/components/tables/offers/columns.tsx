import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableActionButtons } from "../shared/TableActionButtons";
import { StudyOffer } from "@/app/admin/types";

// Standardized interface for column props
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
    
    // ID column
    columnHelper.accessor("uniqueId", {
      header: ({ column }) => <SortableHeader column={column} title="ID" align="left" />,
      cell: (info) => (
        <span className="font-mono text-xs">
          {info.getValue() || "—"}
        </span>
      ),
    }),
    
    // Title column
    columnHelper.accessor("title", {
      header: ({ column }) => <SortableHeader column={column} title="Title" align="left" />,
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
    
    // University column
    columnHelper.accessor("universityName", {
      header: ({ column }) => <SortableHeader column={column} title="University" align="left" />,
      cell: (info) => info.getValue(),
    }),
    
    // Location column
    columnHelper.accessor("location", {
      header: ({ column }) => <SortableHeader column={column} title="Location" align="center" />,
      cell: (info) => <div className="text-center">{info.getValue()}</div>,
      meta: {
        className: "hidden md:table-cell",
      },
    }),
    
    // Degree column
    columnHelper.accessor("degreeLevel", {
      header: ({ column }) => <SortableHeader column={column} title="Degree" align="center" />,
      cell: (info) => <div className="text-center">{info.getValue()}</div>,
      meta: {
        className: "hidden md:table-cell",
      },
    }),
    
    // Tuition column
    columnHelper.accessor((row) => `${row.tuitionFees.amount} ${row.tuitionFees.currency}/${row.tuitionFees.period}`, {
      id: "tuition",
      header: ({ column }) => <SortableHeader column={column} title="Tuition" align="center" />,
      cell: (info) => <div className="text-center">{info.getValue()}</div>,
      meta: {
        className: "hidden md:table-cell",
      },
    }),
    
    // Actions column
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const offer = info.getValue();
        return (
          <TableActionButtons
            id={offer._id}
            name={offer.title}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            isDeleting={deletingId === offer._id}
          />
        );
      },
      enableSorting: false,
    }),
  ];
} 