import { useState, useEffect } from 'react';

interface City {
  _id: string;
  name: string;
  active: boolean;
  provinceId: string;
}

/**
 * Hook for fetching cities data
 * @returns Object containing cities array and loading state
 */
export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        setIsLoading(true);
        // Replace with actual API call when implemented
        const response = await fetch('/api/cities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        
        const data = await response.json();
        setCities(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error('Error fetching cities:', err);
        
        // For development, use mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          setCities([
            { _id: '1', name: 'New York', active: true, provinceId: '1' },
            { _id: '2', name: 'Los Angeles', active: true, provinceId: '2' },
            { _id: '3', name: 'Chicago', active: true, provinceId: '3' },
            { _id: '4', name: 'Houston', active: true, provinceId: '4' },
            { _id: '5', name: 'Phoenix', active: true, provinceId: '5' },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchCities();
  }, []);

  return { cities, isLoading, error };
} 