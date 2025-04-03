import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { 
  Agent, 
  AgentUpdateInput,
  fetchAgentById, 
  updateAgent, 
  agentKeys 
} from './useAgentsQuery';

export function useAgentQuery(id: string) {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Query for fetching agent details
  const agentQuery = useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => fetchAgentById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Mutation for updating agent
  const updateMutation = useMutation({
    mutationFn: (data: AgentUpdateInput) => updateAgent({ id, data }),
    onSuccess: () => {
      // Invalidate both the detail query and the list query
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      toast({
        title: "Success",
        description: "Agent has been updated successfully",
      });
      
      // Navigate back to agents list after a short delay
      setTimeout(() => {
        router.push("/admin/agents");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Data
    agent: agentQuery.data,
    
    // Query states
    isLoading: agentQuery.isPending,
    isError: agentQuery.isError,
    error: agentQuery.error,
    
    // Operations
    refetch: agentQuery.refetch,
    
    // Mutations
    updateAgent: (data: AgentUpdateInput): Promise<void> => 
      updateMutation.mutateAsync(data).then(() => {}),
    isUpdating: updateMutation.isPending,
  };
} 