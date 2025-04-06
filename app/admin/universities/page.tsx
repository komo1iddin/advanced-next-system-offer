"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UniversityModal } from "../../components/modals/UniversityModal";
import { useUniversitiesQuery } from "./hooks/useUniversitiesQuery";
import { useDeleteUniversity } from "./hooks/useDeleteUniversity";
import { UniversitiesTable } from "@/app/components/tables/UniversitiesTable";
import { Toaster } from "@/components/ui/toaster";
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

export default function UniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: universities = [], isLoading, isError, error, refetch } = useUniversitiesQuery();
  const deleteUniversity = useDeleteUniversity();

  const filteredUniversities = universities.filter((university) =>
    university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.location.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteUniversity.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting university:", error);
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
        <UniversitiesTable
          universities={filteredUniversities}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onDelete={handleDelete}
          refetch={refetch}
        />
      </AdminPageLayout>
      <Toaster />
    </>
  );
} 