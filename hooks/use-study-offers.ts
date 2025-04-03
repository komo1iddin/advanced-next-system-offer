import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

export function useStudyOffers(options: UseStudyOffersOptions = {}) {
  const [offers, setOffers] = useState<StudyOffer[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchOffers = async () => {
    setLoading(true);
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
      
      // Fetch the data
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch study offers');
      }
      
      const { data, pagination: paginationData } = await response.json();
      
      setOffers(data);
      setPagination(paginationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Update URL with current filters
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (degreeLevel) params.append('degreeLevel', degreeLevel);
    if (searchQuery) params.append('search', searchQuery);
    if (featured) params.append('featured', 'true');
    params.append('page', page.toString());
    
    router.push(`/?${params.toString()}`);
  };
  
  // Fetch offers when filters change
  useEffect(() => {
    fetchOffers();
    updateUrlParams();
  }, [category, degreeLevel, searchQuery, featured, page, limit]);
  
  return {
    offers,
    loading,
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
    refetch: fetchOffers
  };
} 