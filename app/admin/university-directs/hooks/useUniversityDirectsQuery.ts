import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export interface UniversityDirect {
  _id: string;
  universityName: string;
  departmentName?: string;
  contactPersonName?: string;
  position?: string;
  description?: string;
  wechat?: string;
  telephone?: string;
  email?: string;
  website?: string;
  active: boolean;
  createdAt: string;
}

// Query keys
export const universityDirectKeys = {
  all: ['universityDirects'] as const,
  lists: () => [...universityDirectKeys.all, 'list'] as const,
  list: (filters: string) => [...universityDirectKeys.lists(), { filters }] as const,
  details: () => [...universityDirectKeys.all, 'detail'] as const,
  detail: (id: string) => [...universityDirectKeys.details(), id] as const,
};

// API functions
export const fetchUniversityDirects = async (): Promise<UniversityDirect[]> => {
  const response = await fetch('/api/university-directs', {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch university directs');
  }
  
  const data = await response.json();
  return data.data;
};

export const toggleUniversityDirectActive = async (id: string, active: boolean): Promise<UniversityDirect> => {
  const response = await fetch(`/api/university-directs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Protection': '1',
    },
    body: JSON.stringify({ active }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update university direct status');
  }
  
  const data = await response.json();
  return data.data;
};

export const deleteUniversityDirect = async (id: string): Promise<void> => {
  const response = await fetch(`/api/university-directs/${id}`, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Protection': '1',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete university direct');
  }
  
  return;
};

export const useUniversityDirectsQuery = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUniversityDirects, setFilteredUniversityDirects] = useState<UniversityDirect[]>([]);
  
  // Fetch all university directs
  const { 
    data: universityDirects = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: universityDirectKeys.lists(),
    queryFn: fetchUniversityDirects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter university directs based on search query
  useEffect(() => {
    if (!universityDirects) {
      setFilteredUniversityDirects([]);
      return;
    }
    
    if (searchQuery.trim() === "") {
      setFilteredUniversityDirects(universityDirects);
    } else {
      const filtered = universityDirects.filter(
        (universityDirect) =>
          universityDirect.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (universityDirect.departmentName && universityDirect.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (universityDirect.contactPersonName && universityDirect.contactPersonName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUniversityDirects(filtered);
    }
  }, [searchQuery, universityDirects]);
  
  // Toggle university direct active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      toggleUniversityDirectActive(id, active),
    onMutate: async ({ id, active }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: universityDirectKeys.lists() });
      
      // Snapshot the previous value
      const previousUniversityDirects = queryClient.getQueryData<UniversityDirect[]>(universityDirectKeys.lists());
      
      // Optimistically update the cache
      if (previousUniversityDirects) {
        queryClient.setQueryData<UniversityDirect[]>(
          universityDirectKeys.lists(),
          previousUniversityDirects.map(universityDirect => 
            universityDirect._id === id 
              ? { ...universityDirect, active } 
              : universityDirect
          )
        );
      }
      
      // Return a context object with the snapshot
      return { previousUniversityDirects };
    },
    onError: (err, { id, active }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUniversityDirects) {
        queryClient.setQueryData(
          universityDirectKeys.lists(),
          context.previousUniversityDirects
        );
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update university direct status",
        variant: "destructive",
      });
    },
    onSuccess: (data, { active }) => {
      toast({
        title: "Status Updated",
        description: `University direct ${active ? 'activated' : 'deactivated'}`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: universityDirectKeys.lists() });
    },
  });
  
  // Delete university direct mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUniversityDirect,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: universityDirectKeys.lists() });
      
      // Snapshot the previous value
      const previousUniversityDirects = queryClient.getQueryData<UniversityDirect[]>(universityDirectKeys.lists());
      
      // Optimistically update the cache
      if (previousUniversityDirects) {
        queryClient.setQueryData<UniversityDirect[]>(
          universityDirectKeys.lists(),
          previousUniversityDirects.filter(universityDirect => universityDirect._id !== id)
        );
      }
      
      // Return a context object with the snapshot
      return { previousUniversityDirects };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUniversityDirects) {
        queryClient.setQueryData(
          universityDirectKeys.lists(),
          context.previousUniversityDirects
        );
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete university direct",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "University direct deleted successfully",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: universityDirectKeys.lists() });
    },
  });
  
  const toggleUniversityDirectActiveStatus = (id: string, currentActive: boolean) => {
    toggleActiveMutation.mutate({ id, active: !currentActive });
  };
  
  const deleteUniversityDirectById = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  return {
    universityDirects: filteredUniversityDirects,
    isLoading,
    isError,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    toggleUniversityDirectActive: toggleUniversityDirectActiveStatus,
    deleteUniversityDirect: deleteUniversityDirectById,
    isDeletingUniversityDirect: deleteMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
  };
}; 