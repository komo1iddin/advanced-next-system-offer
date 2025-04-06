import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudyOffer } from '@/lib/models/StudyOffer';

interface StudyOfferState {
  // State
  selectedOffer: StudyOffer | null;
  filters: {
    category: string | null;
    degreeLevel: string | null;
    search: string | null;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  favorites: string[];

  // Actions
  setSelectedOffer: (offer: StudyOffer | null) => void;
  setFilters: (filters: Partial<StudyOfferState['filters']>) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setPagination: (page: number, limit: number) => void;
  toggleFavorite: (offerId: string) => void;
  clearFilters: () => void;
}

export const useStudyOfferStore = create<StudyOfferState>()(
  persist(
    (set) => ({
      // Initial state
      selectedOffer: null,
      filters: {
        category: null,
        degreeLevel: null,
        search: null,
      },
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
      favorites: [],

      // Actions
      setSelectedOffer: (offer) => set({ selectedOffer: offer }),
      
      setFilters: (newFilters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters },
          page: 1 // Reset to first page when filters change
        })),
      
      setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      
      setPagination: (page, limit) => set({ page, limit }),
      
      toggleFavorite: (offerId) =>
        set((state) => ({
          favorites: state.favorites.includes(offerId)
            ? state.favorites.filter((id) => id !== offerId)
            : [...state.favorites, offerId],
        })),
      
      clearFilters: () =>
        set({
          filters: {
            category: null,
            degreeLevel: null,
            search: null,
          },
          page: 1,
        }),
    }),
    {
      name: 'study-offer-storage',
      partialize: (state) => ({
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        page: state.page,
        limit: state.limit,
        favorites: state.favorites,
      }),
    }
  )
); 