import React from "react";
import { University } from "@/app/admin/universities/hooks/useUniversitiesQuery";
import { AdminTable, ActionButtons, StatusBadge } from "./AdminTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, School } from "lucide-react";
import { UniversityModal } from "@/app/components/modals/UniversityModal";
import { Switch } from "@/components/ui/switch";

interface UniversitiesTableProps {
  universities: University[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onDelete: (id: string) => Promise<void>;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  refetch?: () => void;
}

export function UniversitiesTable({
  universities,
  isLoading,
  isError,
  error,
  onDelete,
  onToggleActive,
  onEdit,
  refetch
}: UniversitiesTableProps) {
  const columns = [
    {
      header: "Name",
      key: "name",
      cell: (university: University) => (
        <span className="font-medium">{university.name}</span>
      )
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
      header: "Status",
      key: "active",
      cell: (university: University) => (
        onToggleActive ? (
          <Switch
            checked={university.active}
            onCheckedChange={() => onToggleActive(university.id, !university.active)}
          />
        ) : (
          <StatusBadge active={university.active} />
        )
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (university: University) => (
        <div className="flex items-center justify-end gap-2">
          {onEdit ? (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEdit(university.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <UniversityModal mode="edit" university={university}>
              <Button variant="outline" size="icon">
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </UniversityModal>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
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
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDelete(university.id)}
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
      <School className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">
        {isLoading ? "Loading universities..." : 
          isError ? "There was an error loading universities. Please try again later." :
          "No universities found. Add your first university to get started."}
      </p>
      {isError && error && (
        <p className="mt-2 text-xs text-red-500">
          {error instanceof Error ? error.message : String(error)}
        </p>
      )}
      {isError && refetch && (
        <Button onClick={() => refetch()} size="sm" className="mt-4">
          Try Again
        </Button>
      )}
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