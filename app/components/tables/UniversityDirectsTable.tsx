import React from "react";
import { AdminTable, StatusBadge } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, Building, Phone, Mail, Globe, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UniversityDirect } from "@/app/admin/university-directs/hooks/useUniversityDirectsQuery";

interface UniversityDirectsTableProps {
  universityDirects: UniversityDirect[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  refetch?: () => void;
}

export function UniversityDirectsTable({
  universityDirects,
  isLoading,
  isError,
  error,
  onToggleActive,
  onEdit,
  onDelete,
  refetch
}: UniversityDirectsTableProps) {
  // Helper function to render contact icons
  const renderContactIcons = (universityDirect: UniversityDirect) => {
    return (
      <div className="flex flex-wrap gap-1">
        {universityDirect.telephone && (
          <Badge variant="outline" className="px-2 py-0">
            <Phone className="h-3 w-3 mr-1" />
            Phone
          </Badge>
        )}
        {universityDirect.email && (
          <Badge variant="outline" className="px-2 py-0">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {universityDirect.website && (
          <Badge variant="outline" className="px-2 py-0">
            <Globe className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )}
        {universityDirect.wechat && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            WeChat
          </Badge>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: "University",
      key: "university",
      cell: (universityDirect: UniversityDirect) => (
        <span className="font-medium">{universityDirect.universityName}</span>
      )
    },
    {
      header: "Department",
      key: "department",
      cell: (universityDirect: UniversityDirect) => (
        universityDirect.departmentName || "-"
      )
    },
    {
      header: "Contact Person",
      key: "contactPerson",
      cell: (universityDirect: UniversityDirect) => (
        universityDirect.contactPersonName ? (
          <div className="flex items-center gap-1">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span>{universityDirect.contactPersonName}</span>
            {universityDirect.position && (
              <span className="text-muted-foreground">
                ({universityDirect.position})
              </span>
            )}
          </div>
        ) : (
          "-"
        )
      )
    },
    {
      header: "Contact Methods",
      key: "contactMethods",
      cell: (universityDirect: UniversityDirect) => renderContactIcons(universityDirect)
    },
    {
      header: "Active",
      key: "active",
      cell: (universityDirect: UniversityDirect) => (
        <Switch
          checked={universityDirect.active}
          onCheckedChange={() => onToggleActive(universityDirect._id, !universityDirect.active)}
        />
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (universityDirect: UniversityDirect) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(universityDirect._id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
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
                <AlertDialogTitle>Delete University Direct</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this university direct contact? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDelete(universityDirect._id)}
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
      <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">No university direct contacts found. Add your first contact to get started.</p>
    </div>
  );

  return (
    <AdminTable
      columns={columns}
      data={universityDirects}
      keyField="_id"
      isLoading={isLoading}
      error={isError ? String(error instanceof Error ? error.message : "Failed to load university directs") : null}
      onRetry={refetch}
      emptyState={emptyState}
      loadingMessage="Loading university direct contacts..."
      errorMessage="Failed to load university direct contacts"
    />
  );
} 