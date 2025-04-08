// Type definitions for study offers

/**
 * Represents a study offer that can be displayed to users
 */
export interface StudyOffer {
  _id: string;
  title: string;
  description: string;
  universityName: string;
  universityId?: string;
  location: string;
  degreeLevel: string;
  category: string;
  startDate: string;
  duration: number;
  durationUnit: string;
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  scholarshipsAvailable: boolean;
  applicationDeadline: string;
  languageRequirements: {
    language: string;
    minimumScore: number;
    testName: string;
  };
  featured: boolean;
  applicationProcess: string;
  uniqueId?: string;
  active: boolean;
  createdAt: string;
}

/**
 * Props for the offers table component
 */
export interface OffersTableProps {
  offers: StudyOffer[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  refetch?: () => void;
  deletingId?: string | null;
} 