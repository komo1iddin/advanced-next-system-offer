"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useCreateUniversity, useUpdateUniversity } from "@/app/admin/universities/hooks/useCreateUpdateUniversity";

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

const formSchema = z.object({
  name: z.string().min(1, "University name is required"),
  locationId: z.string().min(1, "Location is required"),
  localRanking: z.string().optional(),
  worldRanking: z.string().optional(),
});

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

  // Form initialization with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: university?.name || "",
      locationId: university?.location?.id || "",
      localRanking: university?.localRanking?.toString() || "",
      worldRanking: university?.worldRanking?.toString() || "",
    },
  });

  // Effect to reset form when university prop changes
  useEffect(() => {
    if (university && mode === "edit") {
      form.reset({
        name: university.name,
        locationId: university.location.id,
        localRanking: university.localRanking?.toString() || "",
        worldRanking: university.worldRanking?.toString() || "",
      });
    }
  }, [university, form, mode]);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedData = {
      name: values.name,
      locationId: values.locationId,
      localRanking: values.localRanking ? parseInt(values.localRanking) : null,
      worldRanking: values.worldRanking ? parseInt(values.worldRanking) : null,
    };

    try {
      if (mode === "edit" && university) {
        await updateUniversity.mutateAsync({ id: university.id, data: formattedData });
      } else {
        await createUniversity.mutateAsync(formattedData);
      }
      // On success, close the modal and reset the form
      form.reset();
      setOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Operation failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit University" : "Add University"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Update the university details below." 
              : "Add a new university to the system. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {locationError && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                {locationError}
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter university name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingLocations}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : "Select a location"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.length === 0 && !isLoadingLocations && !locationError ? (
                            <div className="p-2 text-sm text-muted-foreground">No locations found</div>
                          ) : (
                            locations.map((location: Location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.city}, {location.province}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Rankings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="localRanking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Ranking</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter local ranking"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="worldRanking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>World Ranking</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter world ranking"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createUniversity.isPending || updateUniversity.isPending}
              >
                {createUniversity.isPending || updateUniversity.isPending 
                  ? "Saving..." 
                  : mode === "edit" ? "Update University" : "Add University"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 