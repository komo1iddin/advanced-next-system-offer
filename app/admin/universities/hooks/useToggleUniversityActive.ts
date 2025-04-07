import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { University } from './useUniversitiesQuery';

interface ToggleActiveParams {
  id: string;
  active: boolean;
}

// API function to update university active status
async function toggleUniversityActive({ id, active }: ToggleActiveParams): Promise<University> {
  const response = await fetch(`/api/admin/universities/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ active }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to update university status' }));
    throw new Error(errorData.error || 'Failed to update university status');
  }

  return await response.json();
}

export function useToggleUniversityActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUniversityActive,
    onMutate: async ({ id, active }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['universities'] });
      
      // Snapshot the previous value
      const previousUniversities = queryClient.getQueryData<University[]>(['universities']);
      
      // Optimistically update
      if (previousUniversities) {
        queryClient.setQueryData<University[]>(
          ['universities'],
          previousUniversities.map(university => 
            university.id === id ? { ...university, active } : university
          )
        );
      }
      
      toast({
        title: "Status Updated",
        description: `University ${active ? 'activated' : 'deactivated'}`,
      });
      
      return { previousUniversities };
    },
    onError: (err, { id, active }, context) => {
      // If there was an error, revert back to the previous value
      if (context?.previousUniversities) {
        queryClient.setQueryData(['universities'], context.previousUniversities);
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update university status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: ['universities'] });
    },
  });
} 