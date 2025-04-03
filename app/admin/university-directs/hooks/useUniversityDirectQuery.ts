import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { UniversityDirect, universityDirectKeys } from "./useUniversityDirectsQuery";

interface UpdateUniversityDirectInput {
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
}

// API Functions
export const fetchUniversityDirectById = async (id: string): Promise<UniversityDirect> => {
  const response = await fetch(`/api/university-directs/${id}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("University direct not found");
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch university direct");
  }
  
  const data = await response.json();
  return data.data;
};

export const updateUniversityDirect = async (
  id: string, 
  universityDirectData: UpdateUniversityDirectInput
): Promise<UniversityDirect> => {
  const response = await fetch(`/api/university-directs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Protection': '1',
    },
    body: JSON.stringify(universityDirectData),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update university direct");
  }
  
  const data = await response.json();
  return data.data;
};

export const useUniversityDirectQuery = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Fetch university direct by ID
  const { 
    data: universityDirect,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: universityDirectKeys.detail(id),
    queryFn: () => fetchUniversityDirectById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update university direct mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUniversityDirectInput) => updateUniversityDirect(id, data),
    onSuccess: () => {
      // Invalidate queries for this university direct and the list
      queryClient.invalidateQueries({ queryKey: universityDirectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: universityDirectKeys.lists() });
      
      // Show success toast
      toast({
        title: "Success",
        description: "University direct has been updated successfully",
      });
      
      // Navigate back to the list page after a short delay
      setTimeout(() => {
        router.push("/admin/university-directs");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update university direct",
        variant: "destructive",
      });
    },
  });
  
  const updateUniversityDirectData = (data: UpdateUniversityDirectInput) => {
    updateMutation.mutate(data);
  };
  
  return {
    universityDirect,
    isLoading,
    isError,
    error,
    refetch,
    updateUniversityDirect: updateUniversityDirectData,
    isUpdating: updateMutation.isPending,
  };
}; 