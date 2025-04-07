"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

// Import the new React Query hook
import { useAgentsQuery } from "./hooks/useAgentsQuery";
import { AgentsTable } from "@/app/components/tables/AgentsTable";

// Import our new AgentModal component
import { AgentModal } from "./components/AgentModal";

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  
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

  return (
    <>
      <AdminPageLayout
        title="Manage Agents"
        description="View and manage your education agents and their contact information."
        actionButton={actionButton}
        cardTitle="Agents"
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        itemCount={filteredAgents.length}
        itemName="agent"
      >
        <AgentsTable
          agents={filteredAgents}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onToggleActive={toggleAgentActive}
          onEdit={handleEdit}
          onDelete={deleteAgent}
          refetch={refetch}
        />
      </AdminPageLayout>
      
      {/* Agent dialog component - using null for children to prevent duplicate button */}
      <AgentModal 
        mode="create" 
        dialogControl={addDialogControl}
        onSubmit={handleAddAgent}
      >
        {null}
      </AgentModal>
      
      <Toaster />
    </>
  );
} 