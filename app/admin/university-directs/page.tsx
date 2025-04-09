"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { AdminPageLayout } from "@/components/ui/admin/page-layout";
import { AddUniversityDirectModal } from "app/components/modals/AddUniversityDirectModal";

// Import the React Query hook and table component
import { useUniversityDirectsQuery } from "./hooks/useUniversityDirectsQuery";
import { TanStackUniversityDirectsTable } from "@/app/components/tables/TanStackUniversityDirectsTable";
import { UniversityDirect } from "./hooks/useUniversityDirectsQuery";

export default function UniversityDirectsPage() {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<UniversityDirect[]>([]);
  
  // Use React Query hook
  const {
    universityDirects,
    isLoading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    toggleUniversityDirectActive,
    deleteUniversityDirect,
    refetch
  } = useUniversityDirectsQuery();
  
  // Handle edit navigation
  const handleEdit = (id: string) => {
    router.push(`/admin/university-directs/edit/${id}`);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedRows.length} selected contact${selectedRows.length > 1 ? 's' : ''}?`);
    
    if (confirmed) {
      // Process deletion for each selected row
      for (const row of selectedRows) {
        await deleteUniversityDirect(row._id);
      }
      
      // Clear selection after deletion
      setSelectedRows([]);
    }
  };

  // Bulk actions UI
  const bulkActionsUI = selectedRows.length > 0 ? (
    <div className="flex items-center justify-between w-full">
      <p className="text-sm font-medium">
        {selectedRows.length} contact{selectedRows.length !== 1 ? 's' : ''} selected
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
  ) : null;

  // Add button UI
  const actionButton = (
    <AddUniversityDirectModal>
      <Button variant="default" className="w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add University Contact
      </Button>
    </AddUniversityDirectModal>
  );

  // Breadcrumbs for this page
  const breadcrumbs = [
    { title: "University Contacts", href: "/admin/university-directs" }
  ];

  return (
    <>
      <AdminPageLayout
        title="University Contacts"
        description="View and manage your direct university contacts and their information."
        actionButton={actionButton}
        breadcrumbs={breadcrumbs}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        itemCount={universityDirects.length}
        itemName="contact"
        bulkActions={bulkActionsUI}
      >
        <TanStackUniversityDirectsTable
          data={universityDirects}
          isLoading={isLoading}
          isError={isError}
          onToggleActive={toggleUniversityDirectActive}
          onEdit={handleEdit}
          onDelete={deleteUniversityDirect}
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