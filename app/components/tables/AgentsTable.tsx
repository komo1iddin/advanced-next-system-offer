import React from "react";
import { AdminTable, StatusBadge } from "./AdminTable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Agent } from "@/app/admin/agents/hooks/useAgentsQuery";
import { Phone, Mail, Globe, MessageSquare, Facebook } from "lucide-react";

interface AgentsTableProps {
  agents: Agent[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  refetch?: () => void;
}

export function AgentsTable({
  agents,
  isLoading,
  isError,
  error,
  onToggleActive,
  onEdit,
  onDelete,
  refetch
}: AgentsTableProps) {
  // Helper function to render contact icons
  const renderContactIcons = (agent: Agent) => {
    const hasContact = 
      agent.telephone || 
      agent.email || 
      agent.website || 
      agent.whatsapp || 
      agent.telegram || 
      agent.wechat || 
      agent.facebookPage;
    
    if (!hasContact) return <span className="text-muted-foreground text-sm">No contacts</span>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {agent.telephone && (
          <Badge variant="outline" className="px-2 py-0">
            <Phone className="h-3 w-3 mr-1" />
            Phone
          </Badge>
        )}
        {agent.email && (
          <Badge variant="outline" className="px-2 py-0">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {agent.website && (
          <Badge variant="outline" className="px-2 py-0">
            <Globe className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )}
        {(agent.whatsapp || agent.telegram || agent.wechat) && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat
          </Badge>
        )}
        {agent.facebookPage && (
          <Badge variant="outline" className="px-2 py-0">
            <Facebook className="h-3 w-3 mr-1" />
            FB
          </Badge>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: "Name",
      key: "name",
      cell: (agent: Agent) => (
        <span className="font-medium">{agent.name}</span>
      )
    },
    {
      header: "Description",
      key: "description",
      cell: (agent: Agent) => (
        <div className="max-w-[300px] truncate">
          {agent.description || "-"}
        </div>
      )
    },
    {
      header: "Contact Types",
      key: "contactTypes",
      cell: (agent: Agent) => renderContactIcons(agent)
    },
    {
      header: "Active",
      key: "active",
      cell: (agent: Agent) => (
        <Switch
          checked={agent.active}
          onCheckedChange={() => onToggleActive(agent._id, !agent.active)}
        />
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      cell: (agent: Agent) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(agent._id)}
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
                <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {agent.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDelete(agent._id)}
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
      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">No agents found. Add your first agent to get started.</p>
    </div>
  );

  return (
    <AdminTable
      columns={columns}
      data={agents}
      keyField="_id"
      isLoading={isLoading}
      error={isError ? String(error instanceof Error ? error.message : "Failed to load agents") : null}
      onRetry={refetch}
      emptyState={emptyState}
      loadingMessage="Loading agents..."
      errorMessage="Failed to load agents"
    />
  );
} 