"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin/page-layout";

// Import the new React Query hook
import { useAgentsQuery, Agent } from "./hooks/useAgentsQuery";
import { TanStackAgentsTable } from "@/app/components/tables/TanStackAgentsTable";

// Import our new AgentModal component
import { AgentModal } from "./components/AgentModal";

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Agent[]>([]);
  
  // State for add dialog
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = useState(false);
  
  // Use the React Query hook
  const { 
    filteredAgents, 
    isLoading, 
    isError, 
    error,
    refetch,
    addAgent,
    isAddingAgent,
    toggleAgentActive,
    deleteAgent 
  } = useAgentsQuery(searchQuery);

  // Handle agent add
  const handleAddAgent = useCallback((data: any) => {
    addAgent(data);
    setIsAddAgentDialogOpen(false);
  }, [addAgent]);

  // Handle edit navigation
  const handleEdit = (id: string) => {
    router.push(`/admin/agents/edit/${id}`);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedRows.length} selected ${selectedRows.length > 1 ? 'agents' : 'agent'}?`);
    
    if (confirmed) {
      // Process deletion for each selected row
      for (const row of selectedRows) {
        await deleteAgent(row._id);
      }
      
      // Clear selection after deletion
      setSelectedRows([]);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (active: boolean) => {
    if (selectedRows.length === 0) return;
    
    const statusText = active ? 'activate' : 'deactivate';
    const confirmed = window.confirm(`Are you sure you want to ${statusText} ${selectedRows.length} selected ${selectedRows.length > 1 ? 'agents' : 'agent'}?`);
    
    if (confirmed) {
      // Process status change for each selected row
      for (const row of selectedRows) {
        await toggleAgentActive(row._id, active);
      }
      
      // Clear selection after update
      setSelectedRows([]);
    }
  };

  // Dialog controls for add agent modal
  const addDialogControl = {
    isOpen: isAddAgentDialogOpen,
    setOpen: setIsAddAgentDialogOpen,
    isSubmitting: isAddingAgent
  };

  // Action button for the header
  const actionButton = (
    <Button onClick={() => setIsAddAgentDialogOpen(true)} variant="default" className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Agent
    </Button>
  );

  // Bulk actions UI
  const bulkActionsUI = selectedRows.length > 0 ? (
    <div className="flex items-center justify-between w-full">
      <p className="text-sm font-medium">
        {selectedRows.length} {selectedRows.length === 1 ? 'agent' : 'agents'} selected
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

  // Breadcrumbs for this page
  const breadcrumbs = [
    { title: "Agents", href: "/admin/agents" }
  ];

  return (
    <>
      <AdminPageLayout
        title="Manage Agents"
        description="View and manage your education agents and their contact information."
        actionButton={actionButton}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        itemCount={filteredAgents.length}
        itemName="agent"
        bulkActions={bulkActionsUI}
        breadcrumbs={breadcrumbs}
      >
        <TanStackAgentsTable
          data={filteredAgents}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onToggleActive={toggleAgentActive}
          onEdit={handleEdit}
          onDelete={deleteAgent}
          onSelectionChange={setSelectedRows}
          globalFilter={searchQuery}
          onGlobalFilterChange={setSearchQuery}
          refetch={refetch}
        />
      </AdminPageLayout>
      
      {/* Agent dialog component - without any trigger button */}
      <AgentModal 
        mode="create" 
        dialogControl={addDialogControl}
        onSubmit={handleAddAgent}
        triggerless={true}
      />
      
      <Toaster />
    </>
  );
} 