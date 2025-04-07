"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateAgentMutation } from "@/app/admin/agents/hooks/useCreateAgentMutation";
import { AgentModal } from "@/app/admin/agents/components/AgentModal";
import { useState } from "react";
import { AddAgentModalComponent } from "./types";

export const AddAgentModal: AddAgentModalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { createAgent, isCreating } = useCreateAgentMutation();
  
  const dialogControl = {
    isOpen,
    setOpen: setIsOpen,
    isSubmitting: isCreating
  };
  
  // Trigger button
  const triggerButton = (
    <Button className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Agent
    </Button>
  );
  
  return (
    <AgentModal 
      mode="create" 
      dialogControl={dialogControl}
      onSubmit={createAgent}
    >
      {triggerButton}
    </AgentModal>
  );
}; 