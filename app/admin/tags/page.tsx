"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import custom hook and components
import { useTagsQuery } from "./hooks/useTagsQuery";
import TagsTable from "./components/TagsTable";
import TagDialogs from "./components/TagDialogs";

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

  // Handle tag edit
  const handleEditTag = useCallback((tag: any) => {
    setSelectedTag(tag);
    setIsEditTagDialogOpen(true);
  }, []);

  // Handle tag delete
  const handleDeleteTag = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteTag(id);
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading tags...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Manage Tags</h1>
          <div className="flex items-center">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : "Failed to load tags"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Manage Tags</h1>
        <div className="flex items-center">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Tag management UI */}
      <TagsTable 
        tags={tagRows}
        isLoading={isLoading}
        loadError={isError ? String(error) : null}
        retryLoad={refetch}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
      />
      
      {/* Tag dialog components */}
      <TagDialogs 
        tags={tags}
        dialogs={{
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
        }}
        onAddTag={handleAddTag}
        onUpdateTag={handleUpdateTag}
      />
    </div>
  );
} 