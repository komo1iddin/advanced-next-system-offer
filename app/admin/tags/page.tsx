"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin/page-layout";

// Import custom hook and components
import { useTagsQuery } from "./hooks/useTagsQuery";
import TagDialogs from "./components/TagDialogs";
import { TanStackTagsTable } from "@/app/components/tables/TanStackTagsTable";
import { TagRow } from "./lib/utils";

export default function TagsPage() {
  const router = useRouter();

  // Use our React Query hook for managing tags
  const { 
    tags, 
    tagRows, 
    isLoading,
    isError,
    error,
    refetch,
    addTag,
    isAddingTag,
    updateTag,
    isUpdatingTag,
    deleteTag
  } = useTagsQuery();

  // State for dialogs and selection
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<TagRow[]>([]);

  // Handle tag edit
  const handleEditTag = useCallback((tag: any) => {
    setSelectedTag(tag);
    setIsEditTagDialogOpen(true);
  }, []);

  // Handle tag delete
  const handleDeleteTag = useCallback((id: string) => {
    deleteTag(id);
  }, [deleteTag]);

  // Handle tag update
  const handleUpdateTag = useCallback((data: any) => {
    if (!selectedTag) return;
    updateTag(selectedTag._id, data);
    setIsEditTagDialogOpen(false);
    setSelectedTag(null);
  }, [selectedTag, updateTag]);

  // Handle tag add
  const handleAddTag = useCallback((data: any) => {
    if (data.name && data.category) {
      // Check if we need to create both a category and tag
      if (data.createMissingCategory) {
        const existingCategories = Array.from(new Set(tags.map(t => t.category)));
        if (!existingCategories.includes(data.category)) {
          // We're creating a new category - this logic should be in the backend
          // but we're handling it here for consistency
          addTag({
            name: data.category,
            category: data.category,
            active: data.active
          });
        }
      }
      
      // Add the actual tag
      addTag({
        name: data.name,
        category: data.category,
        active: data.active
      });
    }
    setIsAddTagDialogOpen(false);
  }, [addTag, tags]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedRows.length} selected ${selectedRows.length > 1 ? 'tags' : 'tag'}?`);
    
    if (confirmed) {
      // Process deletion for each selected row
      for (const row of selectedRows) {
        await deleteTag(row.id);
      }
      
      // Clear selection after deletion
      setSelectedRows([]);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (active: boolean) => {
    if (selectedRows.length === 0) return;
    
    const statusText = active ? 'activate' : 'deactivate';
    const confirmed = window.confirm(`Are you sure you want to ${statusText} ${selectedRows.length} selected ${selectedRows.length > 1 ? 'tags' : 'tag'}?`);
    
    if (confirmed) {
      // Process status change for each selected row
      for (const row of selectedRows) {
        await updateTag(row.id, { active });
      }
      
      // Clear selection after update
      setSelectedRows([]);
    }
  };

  // Handle toggle active status
  const handleToggleActive = (id: string, active: boolean) => {
    // Optimistically update the filtered tags state to show immediate feedback
    const tagToUpdate = filteredTags.find(tag => tag.id === id);
    if (tagToUpdate) {
      // Create a temporary clone of the filtered array with the updated status
      const updatedFilteredTags = filteredTags.map(tag => 
        tag.id === id ? { ...tag, active } : tag
      );
      
      // Update local state for immediate UI response
      // This isn't directly possible since filteredTags is derived from tagRows
      // Instead we'll rely on the updateTag function to handle optimistic updates
    }
    
    // Perform the actual update
    updateTag(id, { active });
  };

  // Filter tags based on search term
  const filteredTags = tagRows.filter(tag => {
    return searchTerm === "" || 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Dialog controls for compatibility with existing components
  const dialogControls = {
    add: {
      isOpen: isAddTagDialogOpen,
      setOpen: setIsAddTagDialogOpen,
      isSubmitting: isAddingTag
    },
    edit: {
      isOpen: isEditTagDialogOpen,
      setOpen: setIsEditTagDialogOpen,
      isSubmitting: isUpdatingTag,
      selected: selectedTag
    }
  };
  
  // Add button to be displayed in the header
  const actionButton = (
    <Button onClick={() => setIsAddTagDialogOpen(true)} variant="default" className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add New Tag
    </Button>
  );

  // Breadcrumbs for this page
  const breadcrumbs = [
    { title: "Tags", href: "/admin/tags" }
  ];

  // Bulk actions UI
  const bulkActionsUI = selectedRows.length > 0 ? (
    <div className="flex items-center justify-between w-full">
      <p className="text-sm font-medium">
        {selectedRows.length} {selectedRows.length === 1 ? 'tag' : 'tags'} selected
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleBulkStatusChange(true)}
        >
          Activate
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleBulkStatusChange(false)}
        >
          Deactivate
        </Button>
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

  return (
    <>
      <AdminPageLayout
        title="Tags"
        description="Create and manage tags for categorizing study offers"
        actionButton={actionButton}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemCount={filteredTags.length}
        itemName="tag"
        bulkActions={bulkActionsUI}
        breadcrumbs={breadcrumbs}
      >
        <TanStackTagsTable
          data={filteredTags}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onToggleActive={handleToggleActive}
          onEdit={handleEditTag}
          onDelete={handleDeleteTag}
          onSelectionChange={setSelectedRows}
          globalFilter={searchTerm}
          onGlobalFilterChange={setSearchTerm}
          refetch={refetch}
        />
      </AdminPageLayout>
      
      {/* Tag dialog components */}
      <TagDialogs 
        tags={tags}
        dialogs={dialogControls}
        onAddTag={handleAddTag}
        onUpdateTag={handleUpdateTag}
      />
      
      <Toaster />
    </>
  );
} 