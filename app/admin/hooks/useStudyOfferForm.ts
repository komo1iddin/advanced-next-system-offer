import { useForm } from "react-hook-form";
import { StudyOffer } from "@/app/components/tables/OffersTable";

export function useStudyOfferForm() {
  // Basic implementation of study offer form using react-hook-form
  return useForm<Partial<StudyOffer>>({
    defaultValues: {
      title: "",
      description: "",
      universityName: "",
      location: "",
      degreeLevel: "",
      category: "",
      active: true,
      featured: false,
      scholarshipsAvailable: false,
      tuitionFees: {
        amount: 0,
        currency: "USD",
        period: "year",
      },
      languageRequirements: {
        language: "English",
        minimumScore: 0,
        testName: "IELTS",
      },
    },
  });
} 