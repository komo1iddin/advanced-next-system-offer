"use client";

import { MapPin } from "lucide-react";
import { LocationRow } from "@/app/admin/locations/lib/utils";
import { Province, City } from "@/app/admin/locations/lib/location-service";
import { BaseTanStackTable } from "./shared/BaseTanStackTable";
import { getLocationColumns } from "./locations/columns";

interface TanStackLocationsTableProps {
  data: LocationRow[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEditProvince?: (province: Province) => void;
  onEditCity?: (city: City) => void;
  onDeleteProvince?: (provinceId: string) => void;
  onDeleteCity?: (cityId: string) => void;
  onToggleActive?: (id: string, type: 'province' | 'city', active: boolean) => void;
  onSelectionChange?: (selectedRows: LocationRow[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  provinces: Province[];
  cities: City[];
}

export function TanStackLocationsTable({
  data = [],
  isLoading = false,
  isError = false,
  error,
  onEditProvince,
  onEditCity,
  onDeleteProvince,
  onDeleteCity,
  onToggleActive,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
  provinces,
  cities
}: TanStackLocationsTableProps) {
  // Get column definitions
  const columns = getLocationColumns({
    onEditProvince,
    onEditCity,
    onDeleteProvince,
    onDeleteCity,
    onToggleActive,
    provinces,
    cities
  });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="locations"
      itemsName="locations"
      emptyIcon={MapPin}
      emptyTitle="No locations found"
      emptyDescription="Use the 'Add Province' or 'Add City' buttons to create locations."
      isLoading={isLoading}
      isError={isError}
      error={error}
      refetch={refetch}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      onSelectionChange={onSelectionChange}
    />
  );
} 