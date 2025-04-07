import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";

// Agent interface
export interface Agent {
  _id: string;
  name: string;
  description?: string;
  whatsapp?: string;
  whatsappGroup?: string;
  wechat?: string;
  wechatGroup?: string;
  telegram?: string;
  telegramGroup?: string;
  telephone?: string;
  facebookPage?: string;
  facebookGroup?: string;
  email?: string;
  website?: string;
  active: boolean;
  createdAt: string;
}

// Input types
export interface AgentCreateInput {
  name: string;
  description?: string;
  whatsapp?: string;
  whatsappGroup?: string;
  wechat?: string;
  wechatGroup?: string;
  telegram?: string;
  telegramGroup?: string;
  telephone?: string;
  facebookPage?: string;
  facebookGroup?: string;
  email?: string;
  website?: string;
  active: boolean;
}

export type AgentUpdateInput = Partial<AgentCreateInput>;

// API functions
export const fetchAgents = async (): Promise<Agent[]> => {
  const response = await fetch('/api/agents');
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch agents' }));
    throw new Error(error.message || 'Failed to fetch agents');
  }
  const data = await response.json();
  return data.data;
};

export const fetchAgentById = async (id: string): Promise<Agent> => {
  const response = await fetch(`/api/agents/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Agent not found");
    } else {
      throw new Error("Failed to fetch agent");
    }
  }
  
  return await response.json();
};

export const createAgent = async (data: AgentCreateInput): Promise<Agent> => {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create agent' }));
    throw new Error(errorData.error || 'Failed to create agent');
  }
  
  return await response.json();
};

export const updateAgent = async ({ id, data }: { id: string; data: AgentUpdateInput }): Promise<Agent> => {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Protection': '1',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to update agent' }));
    throw new Error(errorData.error || 'Failed to update agent');
  }
  
  return await response.json();
};

export const deleteAgent = async (id: string): Promise<void> => {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Protection': '1',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete agent' }));
    throw new Error(errorData.error || 'Failed to delete agent');
  }
};

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

// Main hook for managing agents listing
export function useAgentsQuery(searchQuery: string = '') {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching all agents
  const agentsQuery = useQuery({
    queryKey: agentKeys.lists(),
    queryFn: fetchAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter agents based on search query
  const filteredAgents = searchQuery.trim() === '' 
    ? agentsQuery.data || []
    : (agentsQuery.data || []).filter(
        agent => 
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Mutation for adding a new agent
  const addAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add agent",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for toggling agent active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      updateAgent({ id, data: { active } }),
    onMutate: async ({ id, active }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.lists() });
      
      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(agentKeys.lists());
      
      // Optimistically update
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(
          agentKeys.lists(),
          previousAgents.map(agent => 
            agent._id === id ? { ...agent, active } : agent
          )
        );
      }
      
      toast({
        title: "Status Updated",
        description: `Agent ${active ? 'activated' : 'deactivated'}`,
      });
      
      return { previousAgents };
    },
    onError: (err, { id, active }, context) => {
      // If there was an error, revert back to the previous value
      if (context?.previousAgents) {
        queryClient.setQueryData(agentKeys.lists(), context.previousAgents);
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update agent status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
  
  // Mutation for deleting an agent
  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.lists() });
      
      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(agentKeys.lists());
      
      // Optimistically update
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(
          agentKeys.lists(),
          previousAgents.filter(agent => agent._id !== id)
        );
      }
      
      return { previousAgents };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
    },
    onError: (err, id, context) => {
      // If there was an error, revert back to the previous value
      if (context?.previousAgents) {
        queryClient.setQueryData(agentKeys.lists(), context.previousAgents);
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete agent",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
  
  return {
    // Data
    agents: agentsQuery.data || [],
    filteredAgents,
    
    // Query states
    isLoading: agentsQuery.isPending,
    isError: agentsQuery.isError,
    error: agentsQuery.error,
    
    // Operations
    refetch: agentsQuery.refetch,
    
    // Mutations
    addAgent: (data: AgentCreateInput): Promise<void> => 
      addAgentMutation.mutateAsync(data).then(() => {}),
    isAddingAgent: addAgentMutation.isPending,
    
    toggleAgentActive: (id: string, currentActive: boolean): Promise<void> => 
      toggleActiveMutation.mutateAsync({ id, active: !currentActive }).then(() => {}),
    isTogglingActive: toggleActiveMutation.isPending,
    
    deleteAgent: (id: string): Promise<void> => 
      deleteMutation.mutateAsync(id).then(() => {}),
    isDeletingAgent: deleteMutation.isPending,
  };
} 