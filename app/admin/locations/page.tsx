"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

// Import custom hook and components
import { useLocationsQuery } from "./hooks/useLocationsQuery";
import LocationDialogs from "./components/LocationDialogs";
import { LocationsTable } from "@/app/components/tables/LocationsTable";

// Add CSS to prevent floating buttons
import '@/app/globals.css';

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

  // Create action buttons for the header (two buttons: Add Province and Add City)
  const actionButtons = (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={() => setIsAddProvinceDialogOpen(true)} variant="default">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Province
      </Button>
      <Button onClick={() => setIsAddCityDialogOpen(true)} variant="default">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add City
      </Button>
    </div>
  );

  return (
    <div className="locations-page">
      <style jsx>{`
        /* Override any potential styling for bottom buttons */
        .locations-page + div,
        .locations-page + div[class*="fixed"],
        .locations-page + button,
        .locations-page ~ div[class*="fixed"] {
          display: none !important;
        }
      `}</style>
      <AdminPageLayout
        title="Locations"
        description="Manage provinces/states and cities in your application"
        actionButton={actionButtons}
        cardTitle="All Locations"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemCount={filteredLocations.length}
        itemName="location"
      >
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
      </AdminPageLayout>
      
      {/* All dialogs are contained in this component */}
      <LocationDialogs
        provinces={provinces}
        dialogs={dialogControls}
        onAddProvince={handleAddProvince}
        onUpdateProvince={handleUpdateProvince}
        onAddCity={handleAddCity}
        onUpdateCity={handleUpdateCity}
      />
      
      <Toaster />
    </div>
  );
} 