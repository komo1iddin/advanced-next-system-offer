"use client";

import { useState } from "react";
import { TanStackUniversitiesTable } from "@/app/components/tables/TanStackUniversitiesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { University } from "@/app/admin/universities/hooks/useUniversitiesQuery";

// Mock data for the table
const mockUniversities: University[] = [
  {
    id: "1",
    name: "Harvard University",
    active: true,
    worldRanking: 1,
    localRanking: 1,
    location: {
      id: "loc1",
      city: "Cambridge",
      province: "Massachusetts",
    },
  },
  {
    id: "2",
    name: "Stanford University",
    active: true,
    worldRanking: 2,
    localRanking: 2,
    location: {
      id: "loc2",
      city: "Stanford",
      province: "California",
    },
  },
  {
    id: "3",
    name: "Massachusetts Institute of Technology",
    active: true,
    worldRanking: 3,
    localRanking: 3,
    location: {
      id: "loc3",
      city: "Cambridge",
      province: "Massachusetts",
    },
  },
  {
    id: "4",
    name: "University of California, Berkeley",
    active: false,
    worldRanking: 4,
    localRanking: 4,
    location: {
      id: "loc4",
      city: "Berkeley",
      province: "California",
    },
  },
  {
    id: "5",
    name: "University of Cambridge",
    active: true,
    worldRanking: 5,
    localRanking: 1,
    location: {
      id: "loc5",
      city: "Cambridge",
      province: "Cambridgeshire",
    },
  },
  {
    id: "6",
    name: "University of Oxford",
    active: true,
    worldRanking: 6,
    localRanking: 2,
    location: {
      id: "loc6",
      city: "Oxford",
      province: "Oxfordshire",
    },
  },
  {
    id: "7",
    name: "California Institute of Technology",
    active: true,
    worldRanking: 7,
    localRanking: 5,
    location: {
      id: "loc7",
      city: "Pasadena",
      province: "California",
    },
  },
  {
    id: "8",
    name: "University of Chicago",
    active: false,
    worldRanking: 8,
    localRanking: 6,
    location: {
      id: "loc8",
      city: "Chicago",
      province: "Illinois",
    },
  },
  {
    id: "9",
    name: "Yale University",
    active: true,
    worldRanking: 9,
    localRanking: 7,
    location: {
      id: "loc9",
      city: "New Haven",
      province: "Connecticut",
    },
  },
  {
    id: "10",
    name: "Princeton University",
    active: true,
    worldRanking: 10,
    localRanking: 8,
    location: {
      id: "loc10",
      city: "Princeton",
      province: "New Jersey",
    },
  },
];

export default function UniversitiesTableDemo() {
  // State for the demo component
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [universities, setUniversities] = useState<University[]>(mockUniversities);
  const [selectedRows, setSelectedRows] = useState<University[]>([]);

  // Simulating a loading state
  const handleToggleLoading = () => {
    setIsLoading((prev) => !prev);
  };

  // Simulating an error state
  const handleToggleError = () => {
    setIsError((prev) => !prev);
  };

  // Handler for edit action
  const handleEdit = (id: string) => {
    toast.info(`Editing university with ID: ${id}`);
  };

  // Handler for delete action
  const handleDelete = (id: string) => {
    toast.success(`Deleted university with ID: ${id}`);
    setUniversities((prev) => prev.filter((university) => university.id !== id));
  };

  // Handler for toggling university active status
  const handleToggleActive = (id: string, active: boolean) => {
    setUniversities((prev) =>
      prev.map((university) =>
        university.id === id ? { ...university, active } : university
      )
    );
    toast.success(
      `University status updated: ${active ? "Active" : "Inactive"}`
    );
  };

  // Simulating refetch action
  const handleRefetch = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsError(false);
      setUniversities(mockUniversities);
      toast.success("Data refreshed");
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Universities Table Demo</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleLoading}>
            Toggle Loading
          </Button>
          <Button variant="outline" onClick={handleToggleError}>
            Toggle Error
          </Button>
          <Button onClick={handleRefetch}>
            Refresh Data
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add University
          </Button>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <div className="bg-muted p-4 rounded-md">
          <p className="font-medium">{selectedRows.length} universities selected</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedRows([])}>
              Clear Selection
            </Button>
            <Button variant="destructive" size="sm">
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <TanStackUniversitiesTable
        data={universities}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onSelectionChange={setSelectedRows}
        refetch={handleRefetch}
      />
    </div>
  );
} 