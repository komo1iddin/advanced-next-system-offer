import React from "react";
import { AdminTable, StatusBadge } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TagRow } from "@/app/admin/tags/lib/utils";
import { Tag } from "@/app/admin/tags/lib/tag-service";

interface TagsTableProps {
  tags: TagRow[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  refetch?: () => void;
}

// Helper function to format date
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export function TagsTable({
  tags,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  refetch
}: TagsTableProps) {
  const columns = [
    {
      header: "Name",
      key: "name",
      cell: (tag: TagRow) => (
        <span className="font-medium">{tag.name}</span>
      )
    },
    {
      header: "Category",
      key: "category",
      cell: (tag: TagRow) => (
        <Badge variant="outline">{tag.category}</Badge>
      )
    },
    {
      header: "Status",
      key: "status",
      className: "text-center",
      cell: (tag: TagRow) => (
        <StatusBadge active={tag.active} />
      )
    },
    {
      header: "Created",
      key: "created",
      cell: (tag: TagRow) => formatDate(tag.createdAt)
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (tag: TagRow) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              const originalTag: Tag = {
                _id: tag.id,
                name: tag.name,
                category: tag.category,
                active: tag.active,
                createdAt: tag.createdAt.toString(),
                updatedAt: new Date().toString(),
              };
              onEdit(originalTag);
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the tag "{tag.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(tag.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  const emptyState = (
    <div className="text-center py-8">
      <TagIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">No tags found. Add your first tag to get started.</p>
    </div>
  );

  return (
    <AdminTable
      columns={columns}
      data={tags}
      keyField="id"
      isLoading={isLoading}
      error={isError ? String(error instanceof Error ? error.message : "Failed to load tags") : null}
      onRetry={refetch}
      emptyState={emptyState}
      loadingMessage="Loading tags..."
      errorMessage="Failed to load tags"
    />
  );
} 