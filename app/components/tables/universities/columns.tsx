import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { University } from "@/app/admin/universities/hooks/useUniversitiesQuery";

// Helper function to format ranking display
function formatRanking(rank: number | null): string {
  return rank ? `#${rank}` : "-";
}

// Standardized interface for column props
export interface UniversityColumnsProps {
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
    
    // Location column
    columnHelper.accessor((row) => row.location, {
      id: "location",
      header: ({ column }) => <SortableHeader column={column} title="Location" align="center" />,
      cell: (info) => {
        const location = info.getValue();
        return (
          <div className="text-center">
            {location.city}{location.province ? `, ${location.province}` : ""}
          </div>
        );
      },
    }),
    
    // Local Ranking column
    columnHelper.accessor("localRanking", {
      header: ({ column }) => <SortableHeader column={column} title="Local Rank" align="center" />,
      cell: (info) => <div className="text-center">{formatRanking(info.getValue())}</div>,
    }),
    
    // World Ranking column
    columnHelper.accessor("worldRanking", {
      header: ({ column }) => <SortableHeader column={column} title="World Rank" align="center" />,
      cell: (info) => <div className="text-center">{formatRanking(info.getValue())}</div>,
    }),
    
    // Status column
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
    
    // Actions column
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const university = info.getValue();
        
        return (
          <TableActionButtons
            id={university.id}
            name={university.name}
            onEdit={onEdit ? (id) => onEdit(id) : undefined}
            onDelete={onDelete ? (id) => onDelete(id) : undefined}
            onToggleActive={onToggleActive ? (id, active) => onToggleActive(id, active) : undefined}
            isActive={university.active}
          />
        );
      },
      enableSorting: false,
    }),
  ];
} 