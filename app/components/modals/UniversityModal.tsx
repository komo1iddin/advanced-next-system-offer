"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useCreateUniversity, useUpdateUniversity } from "@/app/admin/universities/hooks/useCreateUpdateUniversity";
import { 
  FormModal, 
  FormSection, 
  FormRow, 
  FormTextField, 
  FormSelectField, 
  FormHelperText,
  validation
} from "@/app/components/forms";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Location {
  id: string;
  city: string;
  province: string;
}

interface University {
  id: string;
  name: string;
  localRanking: number | null;
  worldRanking: number | null;
  location: Location;
}

// This schema is for the form inputs
const formSchema = z.object({
  name: validation.requiredString("University name is required"),
  locationId: validation.requiredString("Location is required"),
  localRanking: z.string().optional(),
  worldRanking: z.string().optional(),
});

// This type represents the form input values
type FormValues = z.infer<typeof formSchema>;

// The final data that will be submitted to the API
interface UniversityData {
  name: string;
  locationId: string;
  localRanking: number | null;
  worldRanking: number | null;
}

interface UniversityModalProps {
  children: React.ReactNode;
  university?: University; // Optional: if provided, we're in edit mode
  mode: "add" | "edit";
}

export function UniversityModal({ children, university, mode }: UniversityModalProps) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const createUniversity = useCreateUniversity();
  const updateUniversity = useUpdateUniversity();
  const isSubmitting = createUniversity.isPending || updateUniversity.isPending;

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    name: university?.name || "",
    locationId: university?.location?.id || "",
    localRanking: university?.localRanking?.toString() || "",
    worldRanking: university?.worldRanking?.toString() || "",
  };

  // Fetch locations when the modal opens
  useEffect(() => {
    const fetchLocations = async () => {
      if (status !== "authenticated") {
        return;
      }
      
      setIsLoadingLocations(true);
      setLocationError(null);
      
      try {
        const response = await fetch("/api/admin/locations");
        
        if (response.status === 401) {
          setLocationError("Unauthorized. Please make sure you're logged in as an admin.");
          return;
        }
        
        if (!response.ok) {
          setLocationError("Failed to fetch locations");
          return;
        }
        
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocationError("An error occurred while fetching locations");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (open && status === "authenticated") {
      fetchLocations();
    }
  }, [open, status]);

  const handleSubmit = async (values: FormValues) => {
    // Convert string ranking values to numbers or null
    const formattedData: UniversityData = {
      name: values.name,
      locationId: values.locationId,
      localRanking: values.localRanking ? parseInt(values.localRanking) : null,
      worldRanking: values.worldRanking ? parseInt(values.worldRanking) : null,
    };

    try {
      if (mode === "edit" && university) {
        await updateUniversity.mutateAsync({ 
          id: university.id,
          data: formattedData
        });
      } else {
        await createUniversity.mutateAsync(formattedData);
      }
      // On success, close the modal
      setOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Operation failed:", error);
    }
  };

  // Format locations for select field
  const locationOptions = locations.map(location => ({
    label: `${location.city}, ${location.province}`,
    value: location.id
  }));

  // Entity labels for FormModal
  const entityLabels = {
    singular: "University",
    plural: "Universities"
  };
  
  return (
    <FormModal<FormValues>
      mode={mode === "add" ? "create" : "edit"}
      entityLabels={entityLabels}
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      open={open}
      onOpenChange={setOpen}
      renderForm={(form) => (
        <>
          {locationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}
        
          <FormSection title="Basic Information">
            <FormTextField
              name="name"
              label="University Name"
              placeholder="Enter university name"
              required
              disabled={isSubmitting}
            />
            
            <FormSelectField
              name="locationId"
              label="Location"
              options={locationOptions}
              placeholder={isLoadingLocations ? "Loading locations..." : "Select a location"}
              required
              disabled={isSubmitting || isLoadingLocations}
            />
            <FormHelperText>
              Select the city and province where the university is located
            </FormHelperText>
          </FormSection>
          
          <FormSection title="Rankings">
            <FormRow columns={2}>
              <FormTextField
                name="localRanking"
                label="Local Ranking"
                placeholder="Enter number"
                disabled={isSubmitting}
              />
              <FormTextField
                name="worldRanking"
                label="World Ranking"
                placeholder="Enter number"
                disabled={isSubmitting}
              />
            </FormRow>
            <FormHelperText>
              Leave blank if rankings are not available
            </FormHelperText>
          </FormSection>
        </>
      )}
    >
      {children}
    </FormModal>
  );
} 