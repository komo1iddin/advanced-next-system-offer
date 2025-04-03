"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, PlusCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter locations based on search term
  const filteredLocations = locations.filter(location => {
    return searchTerm === "" || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.provinceName && location.provinceName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
        <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading locations...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Locations</h1>
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
      {/* Header with title and add button */}
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-muted-foreground text-sm">
            Manage provinces/states and cities in your application
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsAddProvinceDialogOpen(true)} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Province
          </Button>
          <Button onClick={() => setIsAddCityDialogOpen(true)} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add City
          </Button>
        </div>
      </div>
      
      {/* All dialogs are contained in this component */}
      <LocationDialogs
        provinces={provinces}
        dialogs={dialogControls}
        onAddProvince={handleAddProvince}
        onUpdateProvince={handleUpdateProvince}
        onAddCity={handleAddCity}
        onUpdateCity={handleUpdateCity}
      />
      
      {/* Locations Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle>All Locations</CardTitle>
            <CardDescription>
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? "No locations match your search criteria" : "No locations found. Add a province and city to get started!"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <LocationsTable
                locations={filteredLocations}
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
            </div>
          )}
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
} 