import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from './use-toast';
import { useDebounce } from './use-debounce';

interface StudyOffer {
  _id: string;
  title: string;
  universityName: string;
  description?: string;
  location: string;
  degreeLevel: string;
  programs?: string[];
  tuitionFees: {
    amount: number;
    currency: string;
    period?: string;
  };
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  applicationDeadline: Date;
  languageRequirements?: {
    language: string;
    minimumScore?: string;
    testName?: string;
  }[];
  durationInYears?: number;
  campusFacilities?: string[];
  admissionRequirements?: string[];
  tags: string[];
  color: string;
  accentColor: string;
  category: string;
  images?: string[];
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  detail?: 'summary' | 'full';
  // New options
  minTuition?: number;
  maxTuition?: number;
  minDuration?: number;
  maxDuration?: number;
  sort?: string;
  order?: 'asc' | 'desc';
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
  
  // New filter states
  const [minTuition, setMinTuition] = useState<number | undefined>(
    options.minTuition || (searchParams.get('minTuition') ? Number(searchParams.get('minTuition')) : undefined)
  );
  const [maxTuition, setMaxTuition] = useState<number | undefined>(
    options.maxTuition || (searchParams.get('maxTuition') ? Number(searchParams.get('maxTuition')) : undefined)
  );
  const [minDuration, setMinDuration] = useState<number | undefined>(
    options.minDuration || (searchParams.get('minDuration') ? Number(searchParams.get('minDuration')) : undefined)
  );
  const [maxDuration, setMaxDuration] = useState<number | undefined>(
    options.maxDuration || (searchParams.get('maxDuration') ? Number(searchParams.get('maxDuration')) : undefined)
  );
  const [sort, setSort] = useState<string>(
    options.sort || searchParams.get('sort') || 'createdAt'
  );
  const [order, setOrder] = useState<'asc' | 'desc'>(
    (options.order || searchParams.get('order') || 'desc') as 'asc' | 'desc'
  );
  
  // Pagination
  const [page, setPage] = useState<number>(
    options.initialPage || parseInt(searchParams.get('page') || '1')
  );
  const [limit, setLimit] = useState<number>(
    options.initialLimit || parseInt(searchParams.get('limit') || '8')
  );
  
  // Detail level
  const [detail] = useState<'summary' | 'full'>(
    options.detail || 'summary'
  );
  
  // Debounce search query to prevent excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 400);
  
  // Retry counter for API failures
  const [retryCount, setRetryCount] = useState(0);
  
  // Request ID to handle race conditions
  const currentRequestId = useRef(0);

  // Function to add delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchOffers = useCallback(async (isRetry = false) => {
    // Generate a unique ID for this request
    const requestId = ++currentRequestId.current;
    
    // Only show loading state for initial load or when not retrying
    if (!isRetry) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Construct the query URL
      const params = new URLSearchParams();
      
      // Add essential parameters
      if (category) params.append('category', category);
      if (degreeLevel) params.append('degreeLevel', degreeLevel);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (featured) params.append('featured', 'true');
      
      // Add optional filters if they exist
      if (minTuition !== undefined) params.append('minTuition', minTuition.toString());
      if (maxTuition !== undefined) params.append('maxTuition', maxTuition.toString());
      if (minDuration !== undefined) params.append('minDuration', minDuration.toString());
      if (maxDuration !== undefined) params.append('maxDuration', maxDuration.toString());
      
      // Sorting
      params.append('sort', sort);
      params.append('order', order);
      
      // Pagination
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Detail level
      if (detail === 'full') {
        params.append('detail', 'full');
      }
      
      // Add a cache-busting parameter for retries
      if (isRetry) {
        params.append('_retry', Date.now().toString());
      }
      
      const url = `/api/study-offers?${params.toString()}`;
      
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
      
      // Check if this request is still the current one
      if (requestId !== currentRequestId.current) {
        // A newer request has been made, discard this result
        return;
      }
      
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
    } catch (error: any) {
      // If this request is not the current one, ignore the error
      if (requestId !== currentRequestId.current) {
        return;
      }
      
      const errorMessage = error.message || 'An error occurred while fetching offers';
      setError(errorMessage);
      
      // Handle timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
        if (retryCount < MAX_RETRIES) {
          // Exponential backoff with jitter
          const backoff = RETRY_DELAY * Math.pow(2, retryCount) + Math.random() * 1000;
          setRetryCount(prev => prev + 1);
          
          // Retry after delay
          await delay(backoff);
          fetchOffers(true);
          return;
        }
        
        toast({
          title: 'Connection issue',
          description: 'The server is taking too long to respond. Please try again later.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      // If this is still the current request, update loading state
      if (requestId === currentRequestId.current) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [
    category,
    degreeLevel,
    debouncedSearch, // Use debounced search value
    featured,
    page,
    limit,
    detail,
    retryCount,
    minTuition,
    maxTuition, 
    minDuration,
    maxDuration,
    sort,
    order
  ]);
  
  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (category) params.set('category', category);
    if (degreeLevel) params.set('degreeLevel', degreeLevel);
    if (searchQuery) params.set('search', searchQuery);
    if (featured) params.set('featured', 'true');
    if (page > 1) params.set('page', page.toString());
    if (limit !== 8) params.set('limit', limit.toString());
    
    // Add optional filters
    if (minTuition !== undefined) params.set('minTuition', minTuition.toString());
    if (maxTuition !== undefined) params.set('maxTuition', maxTuition.toString());
    if (minDuration !== undefined) params.set('minDuration', minDuration.toString());
    if (maxDuration !== undefined) params.set('maxDuration', maxDuration.toString());
    if (sort !== 'createdAt') params.set('sort', sort);
    if (order !== 'desc') params.set('order', order);
    
    const search = params.toString();
    const query = search ? `?${search}` : '';
    
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  }, [
    router,
    category,
    degreeLevel,
    searchQuery,
    featured,
    page,
    limit,
    minTuition,
    maxTuition,
    minDuration,
    maxDuration,
    sort,
    order
  ]);
  
  // Fetch offers when filters or pagination changes
  useEffect(() => {
    fetchOffers();
  }, [
    category,
    degreeLevel,
    debouncedSearch, // Use debounced search value to trigger fetch
    featured,
    page,
    limit,
    detail,
    minTuition,
    maxTuition,
    minDuration,
    maxDuration,
    sort,
    order,
    fetchOffers
  ]);
  
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
    // New filter getters/setters
    minTuition,
    setMinTuition,
    maxTuition,
    setMaxTuition,
    minDuration,
    setMinDuration,
    maxDuration,
    setMaxDuration,
    sort,
    setSort,
    order,
    setOrder,
    refetch: () => fetchOffers()
  };
} 