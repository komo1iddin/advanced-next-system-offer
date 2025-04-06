import React from "react";
import { University } from "@/app/admin/universities/hooks/useUniversitiesQuery";
import { AdminTable, ActionButtons, TypeBadge } from "./AdminTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { UniversityModal } from "@/app/components/modals/UniversityModal";

interface UniversitiesTableProps {
  universities: University[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onDelete: (id: string) => Promise<void>;
  refetch?: () => void;
}

export function UniversitiesTable({
  universities,
  isLoading,
  isError,
  error,
  onDelete,
  refetch
}: UniversitiesTableProps) {
  const columns = [
    {
      header: "Name",
      key: "name",
      cell: (university: University) => university.name
    },
    {
      header: "City",
      key: "city",
      cell: (university: University) => university.location.city
    },
    {
      header: "Province",
      key: "province",
      cell: (university: University) => university.location.province
    },
    {
      header: "Local Ranking",
      key: "localRanking",
      className: "text-right",
      cell: (university: University) => university.localRanking || "N/A"
    },
    {
      header: "World Ranking",
      key: "worldRanking",
      className: "text-right",
      cell: (university: University) => university.worldRanking || "N/A"
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (university: University) => (
        <div className="flex items-center justify-end gap-2">
          <UniversityModal mode="edit" university={university}>
            <Button variant="ghost" size="icon">
              <Pencil className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </UniversityModal>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete University</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {university.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(university.id)}
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
    <div className="flex flex-col items-center justify-center py-6 gap-4">
      <p className="text-muted-foreground text-sm">
        No universities found. Use the "Add University" button above to create one.
      </p>
    </div>
  );

  return (
    <AdminTable
      columns={columns}
      data={universities}
      keyField="id"
      isLoading={isLoading}
      error={isError ? String(error instanceof Error ? error.message : "Failed to load universities") : null}
      onRetry={refetch}
      emptyState={emptyState}
      loadingMessage="Loading universities..."
      errorMessage="Failed to load universities"
    />
  );
} 