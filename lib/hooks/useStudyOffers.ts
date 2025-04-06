import { useQuery } from '@tanstack/react-query';
import { useStudyOfferStore } from '@/lib/store/studyOfferStore';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { useDebounce } from './useDebounce';

export const useStudyOffers = () => {
  const { filters, sortBy, sortOrder, page, limit } = useStudyOfferStore();

  // Debounce search to prevent too many API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  return useQuery({
    queryKey: ['studyOffers', { ...filters, search: debouncedSearch, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const query = {
        ...filters,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        page,
        limit,
      };
      return StudyOfferService.getStudyOffers(query);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useStudyOffer = (id: string) => {
  return useQuery({
    queryKey: ['studyOffer', id],
    queryFn: () => StudyOfferService.getStudyOfferById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 