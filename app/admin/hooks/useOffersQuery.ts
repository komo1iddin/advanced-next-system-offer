import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyOffer } from "@/app/admin/types";
import { toast } from "sonner";

// Query keys
const offersKeys = {
  all: ['offers'] as const,
  lists: () => [...offersKeys.all, 'list'] as const,
  detail: (id: string) => [...offersKeys.all, 'detail', id] as const,
};

// API functions
async function getOffers(): Promise<StudyOffer[]> {
  const response = await fetch('/api/study-offers?limit=100');
  if (!response.ok) {
    throw new Error('Failed to fetch study offers');
  }
  const data = await response.json();
  return data.data;
}

async function deleteOffer(id: string): Promise<void> {
  const response = await fetch(`/api/study-offers/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete study offer');
  }
}

async function toggleOfferActive({ id, active }: { id: string; active: boolean }): Promise<StudyOffer> {
  const response = await fetch(`/api/study-offers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ active }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update study offer status');
  }
  
  return response.json();
}

async function createUpdateOffer({ id, data }: { id: string | null; data: Partial<StudyOffer> }): Promise<StudyOffer> {
  const url = id ? `/api/study-offers/${id}` : '/api/study-offers';
  const method = id ? 'PUT' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to ${id ? 'update' : 'create'} study offer`);
  }
  
  return response.json();
}

// Hooks
export function useGetOffers() {
  return useQuery({
    queryKey: offersKeys.lists(),
    queryFn: getOffers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offersKeys.lists() });
      toast("Study offer deleted successfully");
    },
    onError: (error: Error) => {
      toast(`Failed to delete study offer: ${error.message}`);
    },
  });
}

export function useToggleOfferActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleOfferActive,
    onMutate: async ({ id, active }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: offersKeys.lists() });
      
      // Snapshot the previous value
      const previousOffers = queryClient.getQueryData<StudyOffer[]>(offersKeys.lists());
      
      // Optimistically update to the new value
      if (previousOffers) {
        queryClient.setQueryData<StudyOffer[]>(
          offersKeys.lists(),
          previousOffers.map(offer => 
            offer._id === id ? { ...offer, active } : offer
          )
        );
      }
      
      return { previousOffers };
    },
    onSuccess: (_, { active }) => {
      toast(`Study offer ${active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error, _, context) => {
      // Rollback to the previous value if available
      if (context?.previousOffers) {
        queryClient.setQueryData(offersKeys.lists(), context.previousOffers);
      }
      toast(`Failed to update study offer status: ${error.message}`);
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: offersKeys.lists() });
    },
  });
}

export function useCreateUpdateOffer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUpdateOffer,
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: offersKeys.lists() });
      
      if (id) {
        queryClient.invalidateQueries({ queryKey: offersKeys.detail(id) });
      }
    },
  });
} 