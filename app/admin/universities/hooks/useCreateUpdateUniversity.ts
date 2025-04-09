import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface CreateUniversityData {
  name: string;
  locationId: string;
  localRanking: number | null;
  worldRanking: number | null;
}

interface UpdateUniversityData {
  id: string;
  data: CreateUniversityData;
}

// Create a university
async function createUniversity(data: CreateUniversityData) {
  const response = await fetch("/api/admin/universities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized. Please make sure you're logged in as an admin.");
  }

  if (!response.ok) {
    throw new Error("Failed to create university");
  }

  return response.json();
}

// Update a university
async function updateUniversity({ id, data }: UpdateUniversityData) {
  const response = await fetch(`/api/admin/universities/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized. Please make sure you're logged in as an admin.");
  }

  if (!response.ok) {
    throw new Error("Failed to update university");
  }

  return response.json();
}

export function useCreateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      queryClient.refetchQueries({ queryKey: ["universities"] });
      toast({
        title: "Success",
        description: "University has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create university",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      queryClient.refetchQueries({ queryKey: ["universities"] });
      toast({
        title: "Success",
        description: "University has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update university",
        variant: "destructive",
      });
    },
  });
} 