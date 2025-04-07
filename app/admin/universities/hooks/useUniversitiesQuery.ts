import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Location {
  id: string;
  city: string;
  province: string;
}

export interface University {
  id: string;
  name: string;
  localRanking: number | null;
  worldRanking: number | null;
  location: Location;
  active: boolean;
}

async function fetchUniversities(): Promise<University[]> {
  // Use credentials include to ensure cookies are sent
  const response = await fetch("/api/admin/universities", {
    credentials: "include"
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized. Please make sure you're logged in as an admin.");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch universities");
  }
  
  return response.json();
}

export function useUniversitiesQuery() {
  const { status, data: session } = useSession();
  
  return useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
    // Only run the query when the user is authenticated
    enabled: status === "authenticated" && !!session?.user,
    // Handle unauthorized errors properly during data fetching
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
    // Increase staleTime to prevent too frequent refetching
    staleTime: 30000, // 30 seconds
    // Remove the refetchInterval that was causing too many requests
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
} 