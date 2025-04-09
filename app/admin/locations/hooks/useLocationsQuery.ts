import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Query keys
export const locationKeys = {
  all: ['locations'] as const,
  provinces: () => [...locationKeys.all, 'provinces'] as const,
  province: (id: string) => [...locationKeys.provinces(), id] as const,
  cities: () => [...locationKeys.all, 'cities'] as const,
  city: (id: string) => [...locationKeys.cities(), id] as const,
};

export interface Location {
  id: string;
  city: string;
  province: string;
}

async function fetchLocations(): Promise<Location[]> {
  const response = await fetch("/api/admin/locations");
  if (!response.ok) {
    throw new Error("Failed to fetch locations");
  }
  return response.json();
}

export function useLocationsQuery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Provinces query
  const provincesQuery = useQuery({
    queryKey: locationKeys.provinces(),
    queryFn: fetchProvinces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Cities query
  const citiesQuery = useQuery({
    queryKey: locationKeys.cities(),
    queryFn: fetchCities,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Derived state for locations table
  const provinces = provincesQuery.data || [];
  const cities = citiesQuery.data || [];
  const locations: LocationRow[] = 
    provinces.length > 0 && cities.length > 0 
      ? processLocationsForTable(provinces, cities)
      : [];
  
  // Loading and error states
  const isLoading = provincesQuery.isPending || citiesQuery.isPending;
  const isError = provincesQuery.isError || citiesQuery.isError;
  const error = provincesQuery.error || citiesQuery.error;
  
  // Province mutations
  const addProvinceMutation = useMutation({
    mutationFn: addProvince,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.provinces() });
      toast({ title: "Success", description: "Province added successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add province",
        variant: "destructive",
      });
    }
  });
  
  const updateProvinceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; active: boolean } }) => 
      updateProvince(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: locationKeys.all });
      
      // Snapshot the previous value
      const previousProvinces = queryClient.getQueryData<Province[]>(locationKeys.provinces());
      const previousCities = queryClient.getQueryData<City[]>(locationKeys.cities());
      
      // Optimistically update provinces
      if (previousProvinces) {
        const updatedProvinces = previousProvinces.map(province => 
          province._id === id ? { ...province, ...data } : province
        );
        
        queryClient.setQueryData<Province[]>(locationKeys.provinces(), updatedProvinces);
      }
      
      return { previousProvinces, previousCities };
    },
    onError: (err, { id, data }, context) => {
      // If there was an error, revert back to the previous values
      if (context?.previousProvinces) {
        queryClient.setQueryData(locationKeys.provinces(), context.previousProvinces);
      }
      if (context?.previousCities) {
        queryClient.setQueryData(locationKeys.cities(), context.previousCities);
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update province",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Province updated successfully" });
    }
  });
  
  const deleteProvinceMutation = useMutation({
    mutationFn: deleteProvince,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      toast({ title: "Success", description: "Province deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete province",
        variant: "destructive",
      });
    }
  });
  
  // City mutations
  const addCityMutation = useMutation({
    mutationFn: addCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.cities() });
      toast({ title: "Success", description: "City added successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add city",
        variant: "destructive",
      });
    }
  });
  
  const updateCityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; provinceId: string; active: boolean } }) => 
      updateCity(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: locationKeys.cities() });
      
      // Snapshot the previous value
      const previousCities = queryClient.getQueryData<City[]>(locationKeys.cities());
      
      // Optimistically update
      if (previousCities) {
        const updatedCities = previousCities.map(city => {
          if (city._id === id) {
            // Make sure we preserve the correct type structure for provinceId
            return {
              ...city,
              name: data.name,
              active: data.active,
              // Keep the existing provinceId structure
              provinceId: typeof city.provinceId === 'string' 
                ? { _id: data.provinceId, name: '' } // We don't have the name, but will be refreshed
                : { ...city.provinceId, _id: data.provinceId }
            };
          }
          return city;
        });
        
        queryClient.setQueryData<City[]>(locationKeys.cities(), updatedCities);
      }
      
      return { previousCities };
    },
    onError: (err, { id, data }, context) => {
      // If there was an error, revert back to the previous value
      if (context?.previousCities) {
        queryClient.setQueryData(locationKeys.cities(), context.previousCities);
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update city",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: locationKeys.cities() });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "City updated successfully" });
    }
  });
  
  const deleteCityMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.cities() });
      toast({ title: "Success", description: "City deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete city",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Data
    provinces,
    cities,
    locations,
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Refetch functions
    refetch: () => {
      provincesQuery.refetch();
      citiesQuery.refetch();
    },
    
    // Province operations
    addProvince: (data: { name: string; active: boolean }): Promise<void> => 
      addProvinceMutation.mutateAsync(data).then(() => {}),
    isAddingProvince: addProvinceMutation.isPending,
    
    updateProvince: (id: string, data: { name: string; active: boolean }): Promise<void> => 
      updateProvinceMutation.mutateAsync({ id, data }).then(() => {}),
    isUpdatingProvince: updateProvinceMutation.isPending,
    
    deleteProvince: (id: string): Promise<void> => deleteProvinceMutation.mutateAsync(id).then(() => {}),
    isDeletingProvince: deleteProvinceMutation.isPending,
    
    // City operations
    addCity: (data: { name: string; provinceId: string; active: boolean }): Promise<void> => 
      addCityMutation.mutateAsync(data).then(() => {}),
    isAddingCity: addCityMutation.isPending,
    
    updateCity: (id: string, data: { name: string; provinceId: string; active: boolean }): Promise<void> => 
      updateCityMutation.mutateAsync({ id, data }).then(() => {}),
    isUpdatingCity: updateCityMutation.isPending,
    
    deleteCity: (id: string): Promise<void> => deleteCityMutation.mutateAsync(id).then(() => {}),
    isDeletingCity: deleteCityMutation.isPending,
  };
} 