import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { QueryFilters } from '@/lib/react-query/types';

interface UseFilteredQueryOptions<TData> {
  // Base query key for cache management
  queryKey: string;
  
  // Default filter values
  defaultFilters?: QueryFilters;
  
  // Default sort field
  defaultSortBy?: string;
  
  // Default sort order
  defaultSortOrder?: 'asc' | 'desc';
  
  // Default page number
  defaultPage?: number;
  
  // Default items per page
  defaultLimit?: number;
  
  // Debounce time for search input in ms
  searchDebounce?: number;
  
  // Function to fetch data from API
  queryFn: (filters: QueryFilters) => Promise<{ data: TData[]; total: number }>;
  
  // Additional query options
  queryOptions?: Omit<
    UseQueryOptions<{ data: TData[]; total: number }, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >;
  
  // Whether to sync filters with URL
  syncWithUrl?: boolean;
}

interface FilteredQueryResult<TData> {
  // The filtered data
  data: TData[];
  
  // Whether data is loading
  isLoading: boolean;
  
  // Whether there was an error
  isError: boolean;
  
  // The error if any
  error: Error | null;
  
  // Total number of items (before pagination)
  total: number;
  
  // Current page number
  page: number;
  
  // Number of items per page
  limit: number;
  
  // Current filters
  filters: QueryFilters;
  
  // Current sort field
  sortBy: string | undefined;
  
  // Current sort order
  sortOrder: 'asc' | 'desc';
  
  // Function to set a specific filter
  setFilter: (key: string, value: any) => void;
  
  // Function to update multiple filters at once
  setFilters: (newFilters: QueryFilters) => void;
  
  // Function to set the search term
  setSearch: (search: string) => void;
  
  // Function to set the page
  setPage: (page: number) => void;
  
  // Function to set the limit
  setLimit: (limit: number) => void;
  
  // Function to set the sort field and direction
  setSort: (field: string, order?: 'asc' | 'desc') => void;
  
  // Function to reset all filters to default
  resetFilters: () => void;
  
  // Function to manually refetch data
  refetch: () => Promise<void>;
  
  // Total number of pages
  totalPages: number;
  
  // Whether there are more pages
  hasNextPage: boolean;
  
  // Whether there are previous pages
  hasPrevPage: boolean;
}

/**
 * Hook for server-side filtered queries with optimized renders
 * 
 * Features:
 * - Server-side filtering (all filtering happens on the server)
 * - Query deduplication (avoids duplicate API calls)
 * - URL synchronization (optional)
 * - Debounced search
 * - Memoized results to prevent unnecessary renders
 * 
 * @param options Configuration options for the filtered query
 * @returns An object with the filtered data and functions to update filters
 */
export function useFilteredQuery<TData>({
  queryKey,
  defaultFilters = {},
  defaultSortBy,
  defaultSortOrder = 'desc',
  defaultPage = 1,
  defaultLimit = 10,
  searchDebounce = 500,
  queryFn,
  queryOptions = {},
  syncWithUrl = false,
}: UseFilteredQueryOptions<TData>): FilteredQueryResult<TData> {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create request cache to deduplicate identical requests
  const requestCache = useRef<Map<string, Promise<any>>>(new Map());
  
  // Initialize state from URL or defaults
  const initFiltersFromUrl = useCallback(() => {
    if (!syncWithUrl) return defaultFilters;
    
    const urlFilters: QueryFilters = { ...defaultFilters };
    
    // Get filters from URL
    for (const [key, value] of searchParams.entries()) {
      if (key === 'page' || key === 'limit') {
        urlFilters[key] = parseInt(value, 10);
      } else if (key === 'sortBy') {
        // Handle in sortBy state
      } else if (key === 'sortOrder') {
        // Handle in sortOrder state
      } else if (value === 'true') {
        urlFilters[key] = true;
      } else if (value === 'false') {
        urlFilters[key] = false;
      } else {
        urlFilters[key] = value;
      }
    }
    
    return urlFilters;
  }, [searchParams, syncWithUrl, defaultFilters]);
  
  // State for filters, pagination, and sorting
  const [filters, setFiltersState] = useState<QueryFilters>(initFiltersFromUrl);
  const [page, setPageState] = useState<number>(
    syncWithUrl && searchParams.has('page') 
      ? parseInt(searchParams.get('page') || '1', 10)
      : defaultPage
  );
  const [limit, setLimitState] = useState<number>(
    syncWithUrl && searchParams.has('limit')
      ? parseInt(searchParams.get('limit') || '10', 10)
      : defaultLimit
  );
  const [sortBy, setSortByState] = useState<string | undefined>(
    syncWithUrl && searchParams.has('sortBy')
      ? searchParams.get('sortBy') || undefined
      : defaultSortBy
  );
  const [sortOrder, setSortOrderState] = useState<'asc' | 'desc'>(
    syncWithUrl && searchParams.has('sortOrder') 
      ? (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc' 
      : defaultSortOrder
  );
  
  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search || '', searchDebounce);
  
  // Created memoized full filters object including pagination and sorting
  const fullFilters = useMemo(() => {
    return {
      ...filters,
      search: debouncedSearch,
      page,
      limit,
      sortBy,
      sortOrder,
    };
  }, [filters, debouncedSearch, page, limit, sortBy, sortOrder]);
  
  // Update URL when filters change
  useEffect(() => {
    if (!syncWithUrl) return;
    
    const params = new URLSearchParams();
    
    // Add all filters to URL params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    
    // Add pagination and sorting to URL params
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (sortBy) params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    
    // Update URL without reloading page
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters, page, limit, sortBy, sortOrder, syncWithUrl, router, pathname]);
  
  // Create deduplicating query function
  const deduplicatedQueryFn = useCallback(async () => {
    const cacheKey = JSON.stringify(fullFilters);
    
    // Return cached promise if we have one for this exact query
    if (requestCache.current.has(cacheKey)) {
      return requestCache.current.get(cacheKey)!;
    }
    
    // Otherwise create a new request
    const promise = queryFn(fullFilters);
    requestCache.current.set(cacheKey, promise);
    
    try {
      return await promise;
    } finally {
      // Clean up cache entry after request completes
      setTimeout(() => {
        requestCache.current.delete(cacheKey);
      }, 0);
    }
  }, [fullFilters, queryFn]);
  
  // Execute the query with React Query
  const queryResult = useQuery({
    queryKey: [queryKey, fullFilters],
    queryFn: deduplicatedQueryFn,
    ...queryOptions,
  });
  
  // Extract data and metadata from the query result
  const { data, isLoading, isError, error, refetch } = queryResult;
  const result = data || { data: [], total: 0 };
  
  // Calculate derived pagination values
  const totalPages = Math.ceil(result.total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // Handler functions for updating filters
  const setFilter = useCallback((key: string, value: any) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
    // Reset to page 1 when changing filters
    setPageState(1);
  }, []);
  
  const setFilters = useCallback((newFilters: QueryFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    // Reset to page 1 when changing filters
    setPageState(1);
  }, []);
  
  const setSearch = useCallback((search: string) => {
    setFiltersState(prev => ({ ...prev, search }));
    // Reset to page 1 when searching
    setPageState(1);
  }, []);
  
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);
  
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    // Reset to page 1 when changing page size
    setPageState(1);
  }, []);
  
  const setSort = useCallback((field: string, order?: 'asc' | 'desc') => {
    setSortByState(field);
    if (order) {
      setSortOrderState(order);
    } else {
      // Toggle order if field is already being sorted
      setSortOrderState(prev => 
        sortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : prev
      );
    }
  }, [sortBy]);
  
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setPageState(defaultPage);
    setLimitState(defaultLimit);
    setSortByState(defaultSortBy);
    setSortOrderState(defaultSortOrder);
  }, [defaultFilters, defaultPage, defaultLimit, defaultSortBy, defaultSortOrder]);
  
  // Manual refetch function with proper typing
  const refetchData = useCallback(async () => {
    await refetch();
  }, [refetch]);
  
  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      data: result.data,
      isLoading,
      isError,
      error: error || null,
      total: result.total,
      page,
      limit,
      filters,
      sortBy,
      sortOrder,
      setFilter,
      setFilters,
      setSearch,
      setPage,
      setLimit,
      setSort,
      resetFilters,
      refetch: refetchData,
      totalPages,
      hasNextPage,
      hasPrevPage,
    }),
    [
      result.data,
      result.total,
      isLoading,
      isError,
      error,
      page,
      limit,
      filters,
      sortBy,
      sortOrder,
      setFilter,
      setFilters,
      setSearch,
      setPage,
      setLimit,
      setSort,
      resetFilters,
      refetchData,
      totalPages,
      hasNextPage,
      hasPrevPage,
    ]
  );
} 