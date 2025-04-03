"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminNav from "@/components/AdminNav";

// Import custom hook and components
import { useLocationsQuery } from "./hooks/useLocationsQuery";
import LocationsTable from "./components/LocationsTable";
import LocationDialogs from "./components/LocationDialogs";

export default function LocationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  // Memoize the check admin status callback
  const checkAdminStatus = useCallback(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/locations");
      return;
    }
    
    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Check admin status on component mount
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

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
  const handleUpdateProvince = useCallback((data: { name: string; active: boolean }) => {
    if (!selectedProvince) return;
    updateProvince(selectedProvince._id, data);
    setIsEditProvinceDialogOpen(false);
    setSelectedProvince(null);
  }, [selectedProvince, updateProvince]);

  const handleUpdateCity = useCallback((data: { name: string; provinceId: string; active: boolean }) => {
    if (!selectedCity) return;
    updateCity(selectedCity._id, data);
    setIsEditCityDialogOpen(false);
    setSelectedCity(null);
  }, [selectedCity, updateCity]);

  // Handle add operations
  const handleAddProvince = useCallback((data: { name: string; active: boolean }) => {
    addProvince(data);
    setIsAddProvinceDialogOpen(false);
  }, [addProvince]);

  const handleAddCity = useCallback((data: { name: string; provinceId: string; active: boolean }) => {
    addCity(data);
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

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated or not admin, don't render anything (router will redirect)
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Location Management</h1>
          
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
    </div>
  );
} 