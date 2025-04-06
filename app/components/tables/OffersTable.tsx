import React from "react";
import { AdminTable, StatusBadge } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, LayoutGrid, ExternalLink } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Types for study offers
export interface StudyOffer {
  _id: string;
  uniqueId?: string;
  title: string;
  universityName: string;
  degreeLevel: string;
  category: string;
  location: string;
  featured: boolean;
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  createdAt: string;
}

interface OffersTableProps {
  offers: StudyOffer[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  refetch?: () => void;
  deletingId?: string | null;
}

export function OffersTable({
  offers,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onView,
  refetch,
  deletingId
}: OffersTableProps) {
  const columns = [
    {
      header: "ID",
      key: "id",
      cell: (offer: StudyOffer) => (
        <span className="font-mono text-xs">
          {offer.uniqueId || "—"}
        </span>
      )
    },
    {
      header: "Title",
      key: "title",
      cell: (offer: StudyOffer) => (
        <div>
          <div className="font-medium">{offer.title}</div>
          <div className="text-xs text-muted-foreground md:hidden">
            {offer.universityName}, {offer.location}
          </div>
          {offer.featured && (
            <Badge className="mt-1 bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
          )}
        </div>
      )
    },
    {
      header: "University",
      key: "university",
      cell: (offer: StudyOffer) => offer.universityName
    },
    {
      header: "Location",
      key: "location",
      className: "hidden md:table-cell",
      cell: (offer: StudyOffer) => offer.location
    },
    {
      header: "Degree",
      key: "degree",
      className: "hidden md:table-cell",
      cell: (offer: StudyOffer) => offer.degreeLevel
    },
    {
      header: "Tuition",
      key: "tuition",
      className: "hidden md:table-cell",
      cell: (offer: StudyOffer) => (
        <span>
          {offer.tuitionFees.amount} {offer.tuitionFees.currency}/{offer.tuitionFees.period}
        </span>
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (offer: StudyOffer) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(offer._id)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-600"
                disabled={deletingId === offer._id}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Study Offer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{offer.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDelete(offer._id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onView(offer._id)}
            title="View"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const emptyState = (
    <div className="text-center py-8">
      <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">No study offers found. Add your first offer to get started.</p>
    </div>
  );

  return (
    <AdminTable
      columns={columns}
      data={offers}
      keyField="_id"
      isLoading={isLoading}
      error={isError ? String(error instanceof Error ? error.message : "Failed to load study offers") : null}
      onRetry={refetch}
      emptyState={emptyState}
      loadingMessage="Loading study offers..."
      errorMessage="Failed to load study offers"
    />
  );
} 