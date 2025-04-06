import React from "react";
import { AdminTable, StatusBadge, TypeBadge } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, RefreshCw, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Types from the original locations implementation
interface Province {
  _id: string;
  name: string;
  active: boolean;
}

interface City {
  _id: string;
  name: string;
  provinceId: Province | { _id: string };
  active: boolean;
}

interface LocationRow {
  id: string;
  type: 'province' | 'city';
  name: string;
  provinceName?: string;
  provinceId?: string;
  active: boolean;
}

interface LocationsTableProps {
  locations: LocationRow[];
  isLoading: boolean;
  loadError?: string | null;
  retryLoad?: () => void;
  onEditProvince: (province: Province) => void;
  onEditCity: (city: City) => void;
  onDeleteProvince: (provinceId: string) => void;
  onDeleteCity: (cityId: string) => void;
  provinces: Province[];
  cities: City[];
}

export function LocationsTable({
  locations,
  isLoading,
  loadError,
  retryLoad,
  onEditProvince,
  onEditCity,
  onDeleteProvince,
  onDeleteCity,
  provinces,
  cities
}: LocationsTableProps) {
  const columns = [
    {
      header: "Name",
      key: "name",
      cell: (location: LocationRow) => (
        <div className="flex items-center">
          {location.type === 'city' && (
            <span className="inline-block w-6 text-center">↳</span>
          )}
          <span className={location.type === 'province' ? 'font-medium' : ''}>
            {location.name}
          </span>
        </div>
      )
    },
    {
      header: "Type",
      key: "type",
      cell: (location: LocationRow) => (
        <TypeBadge 
          type={location.type} 
          label={location.type === 'province' ? 'Province' : 'City'} 
        />
      )
    },
    {
      header: "Status",
      key: "status",
      className: "text-center",
      cell: (location: LocationRow) => (
        <StatusBadge active={location.active} />
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (location: LocationRow) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (location.type === 'province') {
                const province = provinces.find(p => p._id === location.id);
                if (province) onEditProvince(province);
              } else {
                const city = cities.find(c => c._id === location.id);
                if (city) onEditCity(city);
              }
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {location.type === 'province' ? 'Province' : 'City'}</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {location.name}? This action cannot be undone.
                  {location.type === 'province' && ' All cities in this province will also be deleted.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (location.type === 'province') {
                      onDeleteProvince(location.id);
                    } else {
                      onDeleteCity(location.id);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  const emptyState = (
    <div className="text-center py-8">
      <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">No locations found. Use the "Add Province" or "Add City" buttons above to create locations.</p>
    </div>
  );

  return (
    <AdminTable
      columns={columns}
      data={locations}
      keyField="id"
      isLoading={isLoading}
      error={loadError}
      onRetry={retryLoad}
      emptyState={emptyState}
      loadingMessage="Loading locations..."
      errorMessage="Failed to load locations"
    />
  );
} 