import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { universityDirectKeys, UniversityDirect } from "./useUniversityDirectsQuery";

interface CreateUniversityDirectInput {
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

// API Function
export const createUniversityDirect = async (
  data: CreateUniversityDirectInput
): Promise<UniversityDirect> => {
  const response = await fetch('/api/university-directs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Protection': '1',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create university direct");
  }
  
  const responseData = await response.json();
  return responseData.data;
};

export const useCreateUniversityDirectMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const mutation = useMutation({
    mutationFn: createUniversityDirect,
    onSuccess: () => {
      // Invalidate the university directs list query
      queryClient.invalidateQueries({ queryKey: universityDirectKeys.lists() });
      
      // Show success toast
      toast({
        title: "Success",
        description: "University direct has been created successfully",
      });
      
      // Navigate back to the list page after a short delay
      setTimeout(() => {
        router.push("/admin/university-directs");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create university direct",
        variant: "destructive",
      });
    },
  });
  
  return {
    createUniversityDirect: (data: CreateUniversityDirectInput) => mutation.mutate(data),
    isCreating: mutation.isPending,
  };
}; 