"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { AddAgentModal } from "app/components/modals/AddAgentModal";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

// Import the new React Query hook
import { useAgentsQuery } from "./hooks/useAgentsQuery";
import { AgentsTable } from "@/app/components/tables/AgentsTable";

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Use the React Query hook
  const { 
    filteredAgents, 
    isLoading, 
    isError, 
    error,
    refetch,
    toggleAgentActive,
    deleteAgent 
  } = useAgentsQuery(searchQuery);

  // Handle edit navigation
  const handleEdit = (id: string) => {
    router.push(`/admin/agents/edit/${id}`);
  };

  // Action button for the header
  const actionButton = (
    <AddAgentModal />
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
      <Toaster />
    </>
  );
} 