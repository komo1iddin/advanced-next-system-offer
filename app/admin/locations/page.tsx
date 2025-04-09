"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin/page-layout";

// Import custom hook and components
import { useLocationsQuery } from "./hooks/useLocationsQuery";
import LocationDialogs from "./components/LocationDialogs";
import { TanStackLocationsTable } from "@/app/components/tables/TanStackLocationsTable";
import { LocationRow } from "./lib/utils";

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

  // State for dialogs and selection
  const [isAddProvinceDialogOpen, setIsAddProvinceDialogOpen] = useState(false);
  const [isEditProvinceDialogOpen, setIsEditProvinceDialogOpen] = useState(false);
  const [isAddCityDialogOpen, setIsAddCityDialogOpen] = useState(false);
  const [isEditCityDialogOpen, setIsEditCityDialogOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<LocationRow[]>([]);

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

  // Handle toggle active status
  const handleToggleActive = useCallback((id: string, type: 'province' | 'city', active: boolean) => {
    if (type === 'province') {
      updateProvince(id, { name: provinces.find(p => p._id === id)?.name || '', active });
    } else {
      const city = cities.find(c => c._id === id);
      if (city) {
        updateCity(id, { 
          name: city.name, 
          provinceId: typeof city.provinceId === 'string' ? city.provinceId : city.provinceId._id, 
          active 
        });
      }
    }
  }, [provinces, cities, updateProvince, updateCity]);

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const provinces = selectedRows.filter(row => row.type === 'province');
    const cities = selectedRows.filter(row => row.type === 'city');
    
    if (provinces.length > 0 || cities.length > 0) {
      let message = "Are you sure you want to delete ";
      
      if (provinces.length > 0) {
        message += `${provinces.length} ${provinces.length === 1 ? 'province' : 'provinces'}`;
        if (cities.length > 0) message += " and ";
      }
      
      if (cities.length > 0) {
        message += `${cities.length} ${cities.length === 1 ? 'city' : 'cities'}`;
      }
      
      message += "? ";
      
      if (provinces.length > 0) {
        message += "Deleting provinces will also delete all their cities.";
      }
      
      const confirmed = window.confirm(message);
      
      if (confirmed) {
        // Delete provinces first (which will cascade delete their cities)
        for (const province of provinces) {
          await deleteProvince(province.id);
        }
        
        // Then delete individually selected cities
        // This ensures we don't try to delete cities that were already deleted due to province deletion
        const cityIdsToDelete = cities
          .filter(city => !provinces.some(p => p.id === city.provinceId))
          .map(city => city.id);
          
        for (const cityId of cityIdsToDelete) {
          await deleteCity(cityId);
        }
        
        // Clear selection after deletion
        setSelectedRows([]);
      }
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (active: boolean) => {
    if (selectedRows.length === 0) return;
    
    const selectedProvinces = selectedRows.filter(row => row.type === 'province');
    const cities = selectedRows.filter(row => row.type === 'city');
    
    const statusText = active ? 'activate' : 'deactivate';
    
    if (selectedProvinces.length > 0 || cities.length > 0) {
      let message = `Are you sure you want to ${statusText} `;
      
      if (selectedProvinces.length > 0) {
        message += `${selectedProvinces.length} ${selectedProvinces.length === 1 ? 'province' : 'provinces'}`;
        if (cities.length > 0) message += " and ";
      }
      
      if (cities.length > 0) {
        message += `${cities.length} ${cities.length === 1 ? 'city' : 'cities'}`;
      }
      
      message += "?";
      
      const confirmed = window.confirm(message);
      
      if (confirmed) {
        // Update provinces
        for (const selectedProvince of selectedProvinces) {
          // Find the complete province data from the provinces array
          const completeProvince = provinces.find(p => p._id === selectedProvince.id);
          if (completeProvince) {
            await updateProvince(selectedProvince.id, { 
              name: completeProvince.name,
              active 
            });
          }
        }
        
        // Update cities
        for (const city of cities) {
          if (city.provinceId) {
            await updateCity(city.id, { 
              name: city.name, 
              provinceId: city.provinceId, 
              active 
            });
          }
        }
        
        // Clear selection after update
        setSelectedRows([]);
      }
    }
  };

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
  const actionButton = (
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
  );

  // Breadcrumbs for this page
  const breadcrumbs = [
    { title: "Locations", href: "/admin/locations" }
  ];

  // Bulk actions UI
  const bulkActionsUI = selectedRows.length > 0 ? (
    <div className="flex items-center justify-between w-full">
      <p className="text-sm font-medium">
        {selectedRows.length} {selectedRows.length === 1 ? 'location' : 'locations'} selected
        {selectedRows.filter(r => r.type === 'province').length > 0 && (
          <span className="ml-1">
            ({selectedRows.filter(r => r.type === 'province').length} provinces,{' '}
            {selectedRows.filter(r => r.type === 'city').length} cities)
          </span>
        )}
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleBulkStatusChange(true)}
        >
          Activate
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleBulkStatusChange(false)}
        >
          Deactivate
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSelectedRows([])}
        >
          Clear Selection
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleBulkDelete}
        >
          Delete Selected
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <AdminPageLayout
        title="Locations"
        description="Manage provinces/states and cities in your application"
        actionButton={actionButton}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemCount={filteredLocations.length}
        itemName="location"
        bulkActions={bulkActionsUI}
        breadcrumbs={breadcrumbs}
      >
        <TanStackLocationsTable
          data={filteredLocations}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onEditProvince={handleEditProvince}
          onEditCity={handleEditCity}
          onDeleteProvince={handleDeleteProvince}
          onDeleteCity={handleDeleteCity}
          onToggleActive={handleToggleActive}
          onSelectionChange={setSelectedRows}
          globalFilter={searchTerm}
          onGlobalFilterChange={setSearchTerm}
          refetch={refetch}
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
    </>
  );
} 