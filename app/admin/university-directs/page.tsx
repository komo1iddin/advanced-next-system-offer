"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Search
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { AddUniversityDirectModal } from "app/components/modals/AddUniversityDirectModal";

// Import the React Query hook and table component
import { useUniversityDirectsQuery } from "./hooks/useUniversityDirectsQuery";
import { UniversityDirectsTable } from "@/app/components/tables/UniversityDirectsTable";

export default function UniversityDirectsPage() {
  const router = useRouter();
  
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
    refetch
  } = useUniversityDirectsQuery();
  
  // Handle edit navigation
  const handleEdit = (id: string) => {
    router.push(`/admin/university-directs/edit/${id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Improved header with better alignment and spacing */}
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">University Directs</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your direct university contacts and their information.
          </p>
        </div>
        <AddUniversityDirectModal />
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
          <UniversityDirectsTable
            universityDirects={universityDirects}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onToggleActive={toggleUniversityDirectActive}
            onEdit={handleEdit}
            onDelete={deleteUniversityDirect}
            refetch={refetch}
          />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
} 