"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

// Import custom hook and components
import { useTagsQuery } from "./hooks/useTagsQuery";
import TagDialogs from "./components/TagDialogs";
import { TagsTable } from "@/app/components/tables/TagsTable";

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

  // State for dialogs
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // Handle tag edit
  const handleEditTag = useCallback((tag: any) => {
    setSelectedTag(tag);
    setIsEditTagDialogOpen(true);
  }, []);

  // Handle tag delete
  const handleDeleteTag = useCallback((id: string) => {
    setTagToDelete(null);
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
    addTag(data);
    setIsAddTagDialogOpen(false);
  }, [addTag]);

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
  const addButton = (
    <Button onClick={() => setIsAddTagDialogOpen(true)} variant="default" className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add New Tag
    </Button>
  );

  return (
    <>
      <AdminPageLayout
        title="Tags"
        description="Create and manage tags for categorizing study offers"
        actionButton={addButton}
        cardTitle="All Tags"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemCount={filteredTags.length}
        itemName="tag"
      >
        <TagsTable
          tags={filteredTags}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onEdit={handleEditTag}
          onDelete={setTagToDelete}
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
      
      {/* Confirmation dialog for tag deletion */}
      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => tagToDelete && handleDeleteTag(tagToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Toaster />
    </>
  );
} 