import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { AgentCreateInput, createAgent, agentKeys } from './useAgentsQuery';

export function useCreateAgentMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Mutation for creating new agent
  const createMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      // Invalidate agents list to refresh
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      toast({
        title: "Success",
        description: "Agent has been added successfully",
      });
      
      // Navigate back to agents list after a short delay
      setTimeout(() => {
        router.push("/admin/agents");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    }
  });
  
  return {
    createAgent: (data: AgentCreateInput): Promise<void> => 
      createMutation.mutateAsync(data).then(() => {}),
    isCreating: createMutation.isPending,
  };
} 