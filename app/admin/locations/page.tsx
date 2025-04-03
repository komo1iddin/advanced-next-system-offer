"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import custom hook and components
import { useLocationsQuery } from "./hooks/useLocationsQuery";
import LocationsTable from "./components/LocationsTable";
import LocationDialogs from "./components/LocationDialogs";

export default function LocationsPage() {
  const router = useRouter();

  // Use our React Query hook for managing locations
  const { 
    provinces, 
    cities, 
    locations, 
    isLoading,
    isError,
    error,
    refetch,
    addProvince,
    isAddingProvince,
    updateProvince,
    isUpdatingProvince,
    deleteProvince,
    addCity,
    isAddingCity,
    updateCity,
    isUpdatingCity,
    deleteCity
  } = useLocationsQuery();

  // State for dialogs
  const [isAddProvinceDialogOpen, setIsAddProvinceDialogOpen] = useState(false);
  const [isEditProvinceDialogOpen, setIsEditProvinceDialogOpen] = useState(false);
  const [isAddCityDialogOpen, setIsAddCityDialogOpen] = useState(false);
  const [isEditCityDialogOpen, setIsEditCityDialogOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  // Handle edit operations
  const handleEditProvince = useCallback((province: any) => {
    setSelectedProvince(province);
    setIsEditProvinceDialogOpen(true);
  }, []);

  const handleEditCity = useCallback((city: any) => {
    setSelectedCity(city);
    setIsEditCityDialogOpen(true);
  }, []);

  // Handle delete operations
  const handleDeleteProvince = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this province? This will also delete all cities associated with it.")) {
      deleteProvince(id);
    }
  }, [deleteProvince]);

  const handleDeleteCity = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this city?")) {
      deleteCity(id);
    }
  }, [deleteCity]);

  // Handle update operations
  const handleUpdateProvince = useCallback(async (data: { name: string; active: boolean }) => {
    if (!selectedProvince) return;
    await updateProvince(selectedProvince._id, data);
    setIsEditProvinceDialogOpen(false);
    setSelectedProvince(null);
  }, [selectedProvince, updateProvince]);

  const handleUpdateCity = useCallback(async (data: { name: string; provinceId: string; active: boolean }) => {
    if (!selectedCity) return;
    await updateCity(selectedCity._id, data);
    setIsEditCityDialogOpen(false);
    setSelectedCity(null);
  }, [selectedCity, updateCity]);

  // Handle add operations
  const handleAddProvince = useCallback(async (data: { name: string; active: boolean }) => {
    await addProvince(data);
    setIsAddProvinceDialogOpen(false);
  }, [addProvince]);

  const handleAddCity = useCallback(async (data: { name: string; provinceId: string; active: boolean }) => {
    await addCity(data);
    setIsAddCityDialogOpen(false);
  }, [addCity]);

  // Dialog controls for compatibility with existing components
  const dialogControls = {
    province: {
      add: {
        isOpen: isAddProvinceDialogOpen,
        setOpen: setIsAddProvinceDialogOpen,
        isSubmitting: isAddingProvince
      },
      edit: {
        isOpen: isEditProvinceDialogOpen,
        setOpen: setIsEditProvinceDialogOpen,
        isSubmitting: isUpdatingProvince,
        selected: selectedProvince
      }
    },
    city: {
      add: {
        isOpen: isAddCityDialogOpen,
        setOpen: setIsAddCityDialogOpen,
        isSubmitting: isAddingCity
      },
      edit: {
        isOpen: isEditCityDialogOpen,
        setOpen: setIsEditCityDialogOpen,
        isSubmitting: isUpdatingCity,
        selected: selectedCity
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading locations...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Manage Locations</h1>
          <div className="flex items-center">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : "Failed to load locations"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Manage Locations</h1>
        <div className="flex items-center">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Manage provinces/states and cities in your application
        </p>
        
        {/* All dialogs are contained in this component */}
        <LocationDialogs
          provinces={provinces}
          dialogs={dialogControls}
          onAddProvince={handleAddProvince}
          onUpdateProvince={handleUpdateProvince}
          onAddCity={handleAddCity}
          onUpdateCity={handleUpdateCity}
        />
      </div>
      
      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>
            Manage provinces/states and cities in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationsTable
            locations={locations}
            isLoading={isLoading}
            loadError={isError ? String(error) : null}
            retryLoad={refetch}
            onEditProvince={handleEditProvince}
            onEditCity={handleEditCity}
            onDeleteProvince={handleDeleteProvince}
            onDeleteCity={handleDeleteCity}
            provinces={provinces}
            cities={cities}
          />
        </CardContent>
      </Card>
    </div>
  );
} 