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
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  User
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
import { useUniversityDirectsQuery, UniversityDirect } from "./hooks/useUniversityDirectsQuery";

export default function UniversityDirectsPage() {
  const router = useRouter();
  const [universityDirectToDelete, setUniversityDirectToDelete] = useState<string | null>(null);
  
  // Use React Query hook
  const {
    universityDirects,
    isLoading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    toggleUniversityDirectActive,
    deleteUniversityDirect,
    isDeletingUniversityDirect
  } = useUniversityDirectsQuery();
  
  // Show contact icons for university direct
  const renderContactIcons = (universityDirect: UniversityDirect) => {
    return (
      <div className="flex flex-wrap gap-1">
        {universityDirect.telephone && (
          <Badge variant="outline" className="px-2 py-0">
            <Phone className="h-3 w-3 mr-1" />
            Phone
          </Badge>
        )}
        {universityDirect.email && (
          <Badge variant="outline" className="px-2 py-0">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {universityDirect.website && (
          <Badge variant="outline" className="px-2 py-0">
            <Globe className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )}
        {universityDirect.wechat && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            WeChat
          </Badge>
        )}
      </div>
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/university-directs/edit/${id}`);
  };
  
  const handleDelete = () => {
    if (universityDirectToDelete) {
      deleteUniversityDirect(universityDirectToDelete);
      setUniversityDirectToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading university directs...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Manage University Directs</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : "Failed to load university directs"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Improved header with better alignment and spacing */}
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">University Directs</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your direct university contacts and their information.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/university-directs/add")} className="w-full sm:w-auto">
          <Building2 className="mr-2 h-4 w-4" />
          Add New University Direct
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle>University Directs</CardTitle>
            <CardDescription>
              {universityDirects.length} university contact{universityDirects.length !== 1 ? 's' : ''} available
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search university directs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading university directs...</div>
          ) : universityDirects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No university directs match your search criteria" : "No university directs found. Add one to get started!"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">University</TableHead>
                    <TableHead className="font-medium">Department</TableHead>
                    <TableHead className="font-medium">Contact Person</TableHead>
                    <TableHead className="font-medium">Contact Methods</TableHead>
                    <TableHead className="font-medium">Active</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universityDirects.map((universityDirect) => (
                    <TableRow key={universityDirect._id}>
                      <TableCell className="font-medium">{universityDirect.universityName}</TableCell>
                      <TableCell>{universityDirect.departmentName || "-"}</TableCell>
                      <TableCell>
                        {universityDirect.contactPersonName ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{universityDirect.contactPersonName}</span>
                            {universityDirect.position && (
                              <span className="text-xs text-muted-foreground">
                                ({universityDirect.position})
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{renderContactIcons(universityDirect)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={universityDirect.active}
                          onCheckedChange={() => toggleUniversityDirectActive(universityDirect._id, universityDirect.active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(universityDirect._id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setUniversityDirectToDelete(universityDirect._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete University Direct</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{universityDirect.universityName}" university direct?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setUniversityDirectToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isDeletingUniversityDirect}
                                >
                                  {isDeletingUniversityDirect ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
} 