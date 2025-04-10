import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from './use-toast';

interface StudyOffer {
  _id: string;
  title: string;
  universityName: string;
  description: string;
  location: string;
  degreeLevel: string;
  programs: string[];
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  applicationDeadline: Date;
  languageRequirements: {
    language: string;
    minimumScore?: string;
    testName?: string;
  }[];
  durationInYears: number;
  campusFacilities: string[];
  admissionRequirements: string[];
  tags: string[];
  color: string;
  accentColor: string;
  category: string;
  images?: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UseStudyOffersOptions {
  initialCategory?: string;
  initialDegreeLevel?: string;
  initialSearchQuery?: string;
  initialFeatured?: boolean;
  initialLimit?: number;
  initialPage?: number;
}

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; // 1.5 seconds between retries

export function useStudyOffers(options: UseStudyOffersOptions = {}) {
  const [offers, setOffers] = useState<StudyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // Separate loading state for initial load
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: options.initialPage || 1,
    limit: options.initialLimit || 8,
    pages: 0
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter states
  const [category, setCategory] = useState<string | null>(
    options.initialCategory || searchParams.get('category')
  );
  const [degreeLevel, setDegreeLevel] = useState<string | null>(
    options.initialDegreeLevel || searchParams.get('degreeLevel')
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    options.initialSearchQuery || searchParams.get('search') || ''
  );
  const [featured, setFeatured] = useState<boolean>(
    options.initialFeatured || searchParams.get('featured') === 'true'
  );
  
  // Pagination
  const [page, setPage] = useState<number>(
    options.initialPage || parseInt(searchParams.get('page') || '1')
  );
  const [limit, setLimit] = useState<number>(
    options.initialLimit || parseInt(searchParams.get('limit') || '8')
  );
  
  // Retry counter for API failures
  const [retryCount, setRetryCount] = useState(0);

  // Function to add delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchOffers = useCallback(async (isRetry = false) => {
    // Only show loading state for initial load or when not retrying
    if (!isRetry) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Construct the query URL
      let url = '/api/study-offers?';
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (degreeLevel) params.append('degreeLevel', degreeLevel);
      if (searchQuery) params.append('search', searchQuery);
      if (featured) params.append('featured', 'true');
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      url += params.toString();
      
      // Add a cache-busting parameter for retries
      if (isRetry) {
        url += `&_retry=${Date.now()}`;
      }
      
      // Fetch the data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch study offers');
      }
      
      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to fetch study offers');
      }
      
      const { data, pagination: paginationData } = responseData;
      
      setOffers(data || []);
      setPagination(paginationData || { total: 0, page, limit, pages: 0 });
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching offers:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
        
      // Check if we need to retry
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        const retryDelay = RETRY_DELAY * Math.pow(2, retryCount);
        
        console.log(`Retrying in ${retryDelay}ms (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Wait before retrying
        await delay(retryDelay);
        
        // Don't show error toast for retries
        fetchOffers(true);
        return;
      }
      
      // Only show error after all retries are exhausted
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "Error loading data",
        description: "Could not load study offers. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [category, degreeLevel, searchQuery, featured, page, limit, retryCount]);
  
  // Update URL with current filters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (degreeLevel) params.append('degreeLevel', degreeLevel);
    if (searchQuery) params.append('search', searchQuery);
    if (featured) params.append('featured', 'true');
    params.append('page', page.toString());
    
    router.push(`/?${params.toString()}`);
  }, [category, degreeLevel, searchQuery, featured, page, router]);
  
  // Fetch offers when filters change
  useEffect(() => {
    fetchOffers();
    updateUrlParams();
  }, [category, degreeLevel, searchQuery, featured, page, limit, fetchOffers, updateUrlParams]);
  
  return {
    offers,
    loading,
    initialLoading,
    error,
    pagination,
    category,
    setCategory,
    degreeLevel,
    setDegreeLevel,
    searchQuery,
    setSearchQuery,
    featured,
    setFeatured,
    page,
    setPage,
    limit,
    setLimit,
    refetch: () => fetchOffers()
  };
} 