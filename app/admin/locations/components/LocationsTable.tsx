import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, RefreshCw, AlertTriangle } from "lucide-react";

interface Province {
  _id: string;
  name: string;
  active: boolean;
}

interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
  };
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

// Render individual location row to prevent full table re-renders
const LocationRow = React.memo(({
  location,
  provinces,
  cities,
  onEditProvince,
  onEditCity,
  onDeleteProvince,
  onDeleteCity
}: {
  location: LocationRow;
  provinces: Province[];
  cities: City[];
  onEditProvince: (province: Province) => void;
  onEditCity: (city: City) => void;
  onDeleteProvince: (provinceId: string) => void;
  onDeleteCity: (cityId: string) => void;
}) => {
  return (
    <tr 
      className={location.type === 'city' ? 'bg-muted/20' : ''}
    >
      <td className="px-4 py-3">
        {location.type === 'city' && (
          <span className="inline-block w-6 text-center">↳</span>
        )}
        <span className={location.type === 'province' ? 'font-medium' : ''}>
          {location.name}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
          location.type === 'province' 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-violet-100 text-violet-700'
        }`}>
          {location.type === 'province' ? 'Province' : 'City'}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
          location.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {location.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
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
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              if (location.type === 'province') {
                onDeleteProvince(location.id);
              } else {
                onDeleteCity(location.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </td>
    </tr>
  );
});

LocationRow.displayName = 'LocationRow';

function LocationsTable({
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
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading locations...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive/70" />
        <p className="mt-2 text-muted-foreground">Failed to load locations: {loadError}</p>
        <Button 
          onClick={retryLoad} 
          variant="outline" 
          className="mt-4"
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-muted-foreground">No locations found. Add your first province and city.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {locations.map((location) => (
            <LocationRow
              key={location.id}
              location={location}
              provinces={provinces}
              cities={cities}
              onEditProvince={onEditProvince}
              onEditCity={onEditCity}
              onDeleteProvince={onDeleteProvince}
              onDeleteCity={onDeleteCity}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Memoize the entire table component to prevent re-renders if props haven't changed
export default React.memo(LocationsTable); 