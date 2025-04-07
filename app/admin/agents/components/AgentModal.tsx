"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Agent } from "../hooks/useAgentsQuery";
import AgentForm from "./AgentForm";
import { FormModal } from "@/app/components/forms";
import { useCreateAgentMutation } from "../hooks/useCreateAgentMutation";

interface DialogControl<T> {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isSubmitting: boolean;
  selected?: T | null;
}

interface AgentModalProps {
  mode: "create" | "edit";
  dialogControl: DialogControl<Agent>;
  onSubmit: (data: any) => void;
  children?: ReactNode;
}

export function AgentModal({ 
  mode,
  dialogControl,
  onSubmit,
  children
}: AgentModalProps) {
  const { isOpen, setOpen, isSubmitting, selected } = dialogControl;
  
  // Default trigger if none provided
  const defaultTrigger = mode === "create" ? (
    <Button className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Agent
    </Button>
  ) : null;

  return (
    <FormModal
      mode={mode}
      entityLabels={{ singular: "Agent" }}
      open={isOpen}
      onOpenChange={setOpen}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      schema={AgentForm.schema}
      defaultValues={AgentForm.getDefaultValues(selected)}
      renderForm={(form) => <AgentForm.Content form={form} mode={mode} />}
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
      autoCloseOnSuccess={true}
    >
      {children || defaultTrigger}
    </FormModal>
  );
}

// Export a simplified component for adding new agents
export function AddAgentModal({ onAdd }: { onAdd?: (data: any) => void }) {
  const { createAgent, isCreating } = useCreateAgentMutation();
  const [isOpen, setIsOpen] = useState(false);
  
  const dialogControl = {
    isOpen,
    setOpen: setIsOpen,
    isSubmitting: isCreating
  };
  
  // Wrap the createAgent function to use it with the modal
  const handleAddAgent = async (data: any) => {
    await createAgent(data);
    if (onAdd) onAdd(data);
  };
  
  return (
    <AgentModal 
      mode="create" 
      dialogControl={dialogControl}
      onSubmit={handleAddAgent}
    />
  );
} 