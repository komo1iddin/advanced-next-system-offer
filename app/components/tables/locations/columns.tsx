import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "../shared/SortableHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LocationRow } from "@/app/admin/locations/lib/utils";
import { Province, City } from "@/app/admin/locations/lib/location-service";

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
    columnHelper.accessor("type", {
      header: ({ column }) => <SortableHeader column={column} title="Type" />,
      cell: (info) => {
        const type = info.getValue();
        return (
          <Badge 
            variant={type === 'province' ? 'default' : 'outline'}
            className={type === 'province' ? 'bg-blue-500' : 'border-blue-500 text-blue-500'}
          >
            {type === 'province' ? 'Province' : 'City'}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("active", {
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: (info) => {
        const isActive = info.getValue();
        const location = info.row.original;
        
        return onToggleActive ? (
          <div className="flex items-center">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => 
                onToggleActive(location.id, location.type, checked)
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
    columnHelper.accessor((row) => row, {
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const location = info.getValue();
        const isProvince = location.type === 'province';
        
        return (
          <div className="flex justify-center space-x-2">
            {(isProvince && onEditProvince) || (!isProvince && onEditCity) ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (isProvince) {
                    const province = provinces.find(p => p._id === location.id);
                    if (province && onEditProvince) onEditProvince(province);
                  } else {
                    const city = cities.find(c => c._id === location.id);
                    if (city && onEditCity) onEditCity(city);
                  }
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            
            {(isProvince && onDeleteProvince) || (!isProvince && onDeleteCity) ? (
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
                    <AlertDialogTitle>Delete {isProvince ? "Province" : "City"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {location.name}? This action cannot be undone.
                      {isProvince && ' All cities in this province will also be deleted.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        if (isProvince && onDeleteProvince) {
                          onDeleteProvince(location.id);
                        } else if (!isProvince && onDeleteCity) {
                          onDeleteCity(location.id);
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    }),
  ];
} 