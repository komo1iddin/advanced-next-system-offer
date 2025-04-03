"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Edit, 
  Search, 
  Trash2, 
  UserPlus, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  Facebook
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Import the new React Query hook
import { useAgentsQuery, Agent } from "./hooks/useAgentsQuery";

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  
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

  // Handle the deletion confirmation
  const handleDeleteConfirm = async () => {
    if (agentToDelete) {
      await deleteAgent(agentToDelete);
      setAgentToDelete(null);
    }
  };

  // Render contact icons
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
      <div className="flex space-x-2">
        {agent.telephone && (
          <Badge variant="outline" className="text-blue-600">
            <Phone className="h-3 w-3 mr-1" />
            Phone
          </Badge>
        )}
        {agent.email && (
          <Badge variant="outline" className="text-green-600">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {agent.website && (
          <Badge variant="outline" className="text-purple-600">
            <Globe className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )}
        {(agent.whatsapp || agent.telegram || agent.wechat) && (
          <Badge variant="outline" className="text-orange-600">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat
          </Badge>
        )}
        {agent.facebookPage && (
          <Badge variant="outline" className="text-blue-800">
            <Facebook className="h-3 w-3 mr-1" />
            Social
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Manage Agents</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your education agents and their contact information.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/agents/add")} className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Agent
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle>Agents</CardTitle>
            <CardDescription>
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} available
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              <p className="mb-4">Error loading agents</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No agents found. {searchQuery && "Try a different search term or"} add a new agent.</p>
              <Button onClick={() => router.push("/admin/agents/add")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Agent
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Contact Types</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent._id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {agent.description || "-"}
                    </TableCell>
                    <TableCell>{renderContactIcons(agent)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={agent.active}
                        onCheckedChange={() => toggleAgentActive(agent._id, agent.active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(agent._id)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAgentToDelete(agent._id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agent and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
} 