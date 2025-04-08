"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UniversityModal } from "../../components/modals/UniversityModal";
import { useUniversitiesQuery } from "./hooks/useUniversitiesQuery";
import { useDeleteUniversity } from "./hooks/useDeleteUniversity";
import { useToggleUniversityActive } from "./hooks/useToggleUniversityActive";
import { TanStackUniversitiesTable } from "@/app/components/tables/TanStackUniversitiesTable";
import { Toaster } from "@/components/ui/toaster";
import { AdminPageLayout } from "@/components/ui/admin/page-layout";
import { useSession } from "next-auth/react";
import { University } from "./hooks/useUniversitiesQuery";

export default function UniversitiesPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isManuallyFetching, setIsManuallyFetching] = useState(false);
  const [selectedRows, setSelectedRows] = useState<University[]>([]);
  
  const { 
    data: universities = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useUniversitiesQuery();
  
  const deleteUniversity = useDeleteUniversity();
  const toggleUniversityActive = useToggleUniversityActive();

  // Try to manually fetch universities when auth is ready
  useEffect(() => {
    let isMounted = true;
    
    const attemptFetch = async () => {
      if (authStatus === "authenticated" && universities.length === 0 && !isLoading && !isManuallyFetching) {
        setIsManuallyFetching(true);
        try {
          await refetch();
        } catch (error) {
          console.error("Error fetching universities:", error);
        } finally {
          if (isMounted) {
            setIsManuallyFetching(false);
          }
        }
      }
    };
    
    attemptFetch();
    
    return () => {
      isMounted = false;
    };
  }, [authStatus]); // Only depend on authStatus to avoid refetch loops

  const filteredUniversities = universities.filter((university) =>
    university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.location.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteUniversity.mutateAsync(id);
      // Force a refetch after deletion
      refetch();
    } catch (error) {
      console.error("Error deleting university:", error);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    toggleUniversityActive.mutate({ id, active });
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/universities/edit/${id}`);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedRows.length} selected ${selectedRows.length > 1 ? 'universities' : 'university'}?`);
    
    if (confirmed) {
      // Process deletion for each selected row
      for (const row of selectedRows) {
        await handleDelete(row.id);
      }
      
      // Clear selection after deletion
      setSelectedRows([]);
    }
  };

  // Add button to be displayed in the header
  const addButton = (
    <UniversityModal mode="add">
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Add University
      </Button>
    </UniversityModal>
  );

  // Add a debug message if we have issues
  const debugMessage = process.env.NODE_ENV === "development" && isError ? (
    <div className="p-4 my-4 bg-red-50 border border-red-200 rounded-md">
      <h3 className="font-medium text-red-800">Debug Info:</h3>
      <p className="text-red-700">{error instanceof Error ? error.message : "Unknown error"}</p>
      <p className="text-red-700">Auth Status: {authStatus}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={() => refetch()}
      >
        Retry Fetch
      </Button>
    </div>
  ) : null;

  return (
    <>
      <AdminPageLayout
        title="Universities"
        description="Manage university listings and their rankings"
        actionButton={addButton}
        cardTitle="All Universities"
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        itemCount={filteredUniversities.length}
        itemName="university"
      >
        {debugMessage}

        {selectedRows.length > 0 && (
          <div className="mb-4 p-4 bg-muted rounded-md flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedRows.length} {selectedRows.length === 1 ? 'university' : 'universities'} selected
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedRows([])}
              >
                Clear Selection
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        <TanStackUniversitiesTable
          data={filteredUniversities}
          isLoading={isLoading || isManuallyFetching}
          isError={isError}
          error={error}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
          onSelectionChange={setSelectedRows}
          globalFilter={searchQuery}
          onGlobalFilterChange={setSearchQuery}
          refetch={refetch}
        />
      </AdminPageLayout>
      <Toaster />
    </>
  );
} 