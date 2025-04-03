"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Search, Tag as TagIcon, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading tags...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Tags</h1>
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
      {/* Header with title and add button */}
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage tags for categorizing study offers.
          </p>
        </div>
        <Button onClick={() => setIsAddTagDialogOpen(true)} variant="default" className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Tag
        </Button>
      </div>
      
      {/* Main card with search and table */}
      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle>All Tags</CardTitle>
            <CardDescription>
              {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} available
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading tags...</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? "No tags match your search criteria" : "No tags found. Add one to get started!"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <TagsTable 
                tags={filteredTags}
                isLoading={isLoading}
                loadError={isError ? String(error) : null}
                retryLoad={refetch}
                onEditTag={handleEditTag}
                onDeleteTag={(id) => setTagToDelete(id)}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
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
    </div>
  );
} 