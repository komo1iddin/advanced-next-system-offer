import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { LocationRow } from "@/app/admin/locations/lib/utils";
import { Province, City } from "@/app/admin/locations/lib/location-service";

// Standardized interface for column props
export interface LocationColumnsProps {
  onEditProvince?: (province: Province) => void;
  onEditCity?: (city: City) => void;
  onDeleteProvince?: (provinceId: string) => void;
  onDeleteCity?: (cityId: string) => void;
  onToggleActive?: (id: string, type: 'province' | 'city', active: boolean) => void;
  provinces: Province[];
  cities: City[];
}

export function getLocationColumns({
  onEditProvince,
  onEditCity,
  onDeleteProvince,
  onDeleteCity,
  onToggleActive,
  provinces,
  cities
}: LocationColumnsProps): ColumnDef<LocationRow, any>[] {
  const columnHelper = createColumnHelper<LocationRow>();

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
      cell: (info) => {
        const location = info.row.original;
        return (
          <div className="flex items-center">
            {location.type === 'city' && (
              <span className="inline-block w-6 text-center">↳</span>
            )}
            <span className={location.type === 'province' ? 'font-medium' : ''}>
              {info.getValue()}
            </span>
          </div>
        );
      },
    }),
    
    // Type column
    columnHelper.accessor("type", {
      header: ({ column }) => <SortableHeader column={column} title="Type" align="center" />,
      cell: (info) => {
        const type = info.getValue();
        return (
          <div className="text-center">
            <Badge 
              variant={type === 'province' ? 'default' : 'outline'}
              className={type === 'province' ? 'bg-blue-500' : 'border-blue-500 text-blue-500'}
            >
              {type === 'province' ? 'Province' : 'City'}
            </Badge>
          </div>
        );
      },
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
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const location = info.getValue();
        const isProvince = location.type === 'province';
        
        // Custom action handlers for different location types
        const handleEdit = () => {
          if (isProvince && onEditProvince) {
            const province = provinces.find(p => p._id === location.id);
            if (province) onEditProvince(province);
          } else if (!isProvince && onEditCity) {
            const city = cities.find(c => c._id === location.id);
            if (city) onEditCity(city);
          }
        };
        
        const handleDelete = (id: string) => {
          if (isProvince && onDeleteProvince) {
            onDeleteProvince(id);
          } else if (!isProvince && onDeleteCity) {
            onDeleteCity(id);
          }
        };
        
        const handleToggleActive = (id: string, active: boolean) => {
          if (onToggleActive) {
            onToggleActive(id, isProvince ? 'province' : 'city', active);
          }
        };
        
        return (
          <TableActionButtons
            id={location.id}
            name={`${isProvince ? 'Province' : 'City'}: ${location.name}`}
            onEdit={(isProvince && onEditProvince) || (!isProvince && onEditCity) ? handleEdit : undefined}
            onDelete={(isProvince && onDeleteProvince) || (!isProvince && onDeleteCity) ? handleDelete : undefined}
            onToggleActive={onToggleActive ? handleToggleActive : undefined}
            isActive={location.active}
          />
        );
      },
      enableSorting: false,
    }),
  ];
} 