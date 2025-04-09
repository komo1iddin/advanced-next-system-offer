import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Province,
  City,
  fetchProvinces,
  fetchCities,
  addProvince,
  updateProvince,
  deleteProvince,
  addCity,
  updateCity,
  deleteCity
} from "../lib/location-service";
import { LocationRow, processLocationsForTable } from "../lib/utils";

// Maximum number of retries for loading data
const MAX_RETRIES = 2;

export function useLocationManager() {
  // Data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProvince, setIsAddingProvince] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [isEditingProvince, setIsEditingProvince] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  // Submission states
  const [isSubmittingProvince, setIsSubmittingProvince] = useState(false);
  const [isSubmittingCity, setIsSubmittingCity] = useState(false);
  
  // Error state
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if data is being loaded to prevent duplicate requests
  const isLoadingRef = useRef(false);

  const { toast } = useToast();

  // Add effect for cleanup
  useEffect(() => {
    // Force a fresh data load when the component mounts
    console.log("Locations component mounted - forcing fresh data load");
    
    // Reset all state to initial values
    setProvinces([]);
    setCities([]);
    setLocations([]);
    setLoadError(null);
    setRetryCount(0);
    isLoadingRef.current = false;
    
    // Load fresh data
    loadData();
    
    return () => {
      console.log("Locations component unmounted - cleaning up");
      isMounted.current = false;
    };
  }, []); // Empty deps array ensures this only runs once on mount

  // Separate locations update effect
  useEffect(() => {
    setLocations(processLocationsForTable(provinces, cities));
  }, [provinces, cities]);

  // Load all location data with useCallback to maintain reference stability
  const loadData = useCallback(async (retry = false) => {
    // Reset retry count when loading is explicitly requested (not from a retry)
    if (!retry) {
      setRetryCount(0);
    }
    
    // If we've exceeded max retries, don't try again
    if (retry && retryCount >= MAX_RETRIES) {
      console.log(`Maximum retries (${MAX_RETRIES}) exceeded. Giving up.`);
      return;
    }
    
    // Prevent duplicate loading
    if (isLoadingRef.current) {
      console.log("Already loading locations, skipping redundant request");
      return;
    }
    
    // Reset error state
    setLoadError(null);
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Fetching location data... ${retry ? `(retry ${retryCount + 1}/${MAX_RETRIES})` : ''}`);
      
      const [provincesData, citiesData] = await Promise.all([
        fetchProvinces(),
        fetchCities()
      ]);
      
      if (isMounted.current) {
        setProvinces(provincesData);
        setCities(citiesData);
        // Note: locations will be updated in the useEffect above
      }
    } catch (error) {
      console.error("Error in loadData:", error);
      
      if (isMounted.current) {
        // Keep any data we might have fetched previously
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unknown error occurred';
        
        setLoadError(errorMessage);
        
        // Increment retry count if this was a retry
        if (retry) {
          setRetryCount(prev => prev + 1);
        }
        
        // Show toast only on first error or explicit load request
        if (!retry || retryCount === 0) {
          toast({
            title: "Error",
            description: "Failed to load location data. Retrying...",
            variant: "destructive",
          });
        }
        
        // Auto-retry with exponential backoff if under max retries
        if ((retry || retryCount === 0) && retryCount < MAX_RETRIES) {
          const backoffTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Scheduling retry in ${backoffTime}ms`);
          
          setTimeout(() => {
            if (isMounted.current) {
              loadData(true);
            }
          }, backoffTime);
        } else if (retryCount >= MAX_RETRIES) {
          toast({
            title: "Error",
            description: "Failed to load location data after multiple attempts. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [toast, retryCount]);

  // Manually retry loading
  const retryLoad = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Province operations
  const handleAddProvince = useCallback(async (data: { name: string; active: boolean }) => {
    setIsSubmittingProvince(true);
    
    try {
      await addProvince(data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Province added successfully" });
        setIsAddingProvince(false);
        
        // Reload provinces
        const updatedProvinces = await fetchProvinces();
        setProvinces(updatedProvinces);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add province",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingProvince(false);
      }
    }
  }, [toast]);

  const handleUpdateProvince = useCallback(async (data: { name: string; active: boolean }) => {
    if (!selectedProvince) return;
    
    setIsSubmittingProvince(true);
    
    try {
      await updateProvince(selectedProvince._id, data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Province updated successfully" });
        setIsEditingProvince(false);
        setSelectedProvince(null);
        
        // Reload data as both provinces and cities could be affected
        await loadData();
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update province",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingProvince(false);
      }
    }
  }, [selectedProvince, toast, loadData]);

  const handleDeleteProvince = useCallback(async (provinceId: string) => {
    if (!confirm("Are you sure you want to delete this province? This will also delete all cities associated with it.")) {
      return;
    }
    
    try {
      await deleteProvince(provinceId);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Province deleted successfully" });
        
        // Reload data as both provinces and cities could be affected
        await loadData();
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete province",
          variant: "destructive",
        });
      }
    }
  }, [toast, loadData]);

  const handleEditProvince = useCallback((province: Province) => {
    setSelectedProvince(province);
    setIsEditingProvince(true);
  }, []);

  // City operations
  const handleAddCity = useCallback(async (data: { name: string; provinceId: string; active: boolean }) => {
    setIsSubmittingCity(true);
    
    try {
      await addCity(data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "City added successfully" });
        setIsAddingCity(false);
        
        // Reload cities
        const updatedCities = await fetchCities();
        setCities(updatedCities);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add city",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingCity(false);
      }
    }
  }, [toast]);

  const handleUpdateCity = useCallback(async (data: { name: string; provinceId: string; active: boolean }) => {
    if (!selectedCity) return;
    
    setIsSubmittingCity(true);
    
    try {
      await updateCity(selectedCity._id, data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "City updated successfully" });
        setIsEditingCity(false);
        setSelectedCity(null);
        
        // Reload cities
        const updatedCities = await fetchCities();
        setCities(updatedCities);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update city",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingCity(false);
      }
    }
  }, [selectedCity, toast]);

  const handleDeleteCity = useCallback(async (cityId: string) => {
    if (!confirm("Are you sure you want to delete this city?")) {
      return;
    }
    
    try {
      await deleteCity(cityId);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "City deleted successfully" });
        
        // Reload cities
        const updatedCities = await fetchCities();
        setCities(updatedCities);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete city",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleEditCity = useCallback((city: City) => {
    setSelectedCity(city);
    setIsEditingCity(true);
  }, []);

  // Dialog controls
  const dialogControls = {
    province: {
      add: {
        isOpen: isAddingProvince,
        setOpen: setIsAddingProvince,
        isSubmitting: isSubmittingProvince
      },
      edit: {
        isOpen: isEditingProvince,
        setOpen: setIsEditingProvince,
        isSubmitting: isSubmittingProvince,
        selected: selectedProvince
      }
    },
    city: {
      add: {
        isOpen: isAddingCity,
        setOpen: setIsAddingCity,
        isSubmitting: isSubmittingCity
      },
      edit: {
        isOpen: isEditingCity,
        setOpen: setIsEditingCity,
        isSubmitting: isSubmittingCity,
        selected: selectedCity
      }
    }
  };

  return {
    // Data
    provinces,
    cities,
    locations,
    isLoading,
    loadError,
    
    // Operations
    loadData,
    retryLoad,
    handleAddProvince,
    handleUpdateProvince,
    handleDeleteProvince,
    handleEditProvince,
    handleAddCity,
    handleUpdateCity,
    handleDeleteCity,
    handleEditCity,
    
    // Dialog controls
    dialogControls
  };
} 