"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminNav from "@/components/AdminNav";

// Import custom hook and components
import { useTagsQuery } from "./hooks/useTagsQuery";
import TagsTable from "./components/TagsTable";
import TagDialogs from "./components/TagDialogs";

export default function TagsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Use our React Query hook for managing tags
  const { 
    tags, 
    tagRows, 
    isLoading,
    isError,
    error,
    refetch,
    addTag,
    isAddingTag,
    updateTag,
    isUpdatingTag,
    deleteTag
  } = useTagsQuery();

  // State for dialogs
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);

  // Memoize the check admin status callback
  const checkAdminStatus = useCallback(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/tags");
      return;
    }
    
    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Check admin status on component mount
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Handle tag edit
  const handleEditTag = useCallback((tag: any) => {
    setSelectedTag(tag);
    setIsEditTagDialogOpen(true);
  }, []);

  // Handle tag delete
  const handleDeleteTag = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteTag(id);
    }
  }, [deleteTag]);

  // Handle tag update
  const handleUpdateTag = useCallback((data: any) => {
    if (!selectedTag) return;
    updateTag(selectedTag._id, data);
    setIsEditTagDialogOpen(false);
    setSelectedTag(null);
  }, [selectedTag, updateTag]);

  // Handle tag add
  const handleAddTag = useCallback((data: any) => {
    addTag(data);
    setIsAddTagDialogOpen(false);
  }, [addTag]);

  // Dialog controls for compatibility with existing components
  const dialogControls = {
    add: {
      isOpen: isAddTagDialogOpen,
      setOpen: setIsAddTagDialogOpen,
      isSubmitting: isAddingTag
    },
    edit: {
      isOpen: isEditTagDialogOpen,
      setOpen: setIsEditTagDialogOpen,
      isSubmitting: isUpdatingTag,
      selected: selectedTag
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated or not admin, don't render anything (router will redirect)
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    // Instead of returning null, show debug info
    type DebugInfoType = {
      session: {
        exists: boolean;
        user: { role?: string } | null;
      };
      database: {
        userFound: boolean;
        user: { role?: string } | null;
      };
      mismatch: boolean;
      nextSteps: string;
    };
    
    const [debugInfo, setDebugInfo] = useState<DebugInfoType | null>(null);
    const [isDebugLoading, setIsDebugLoading] = useState(false);
    
    const fetchDebugInfo = async () => {
      try {
        setIsDebugLoading(true);
        const response = await fetch('/api/auth/get-debug-session');
        if (!response.ok) {
          throw new Error('Failed to fetch debug info');
        }
        const data = await response.json();
        setDebugInfo(data as DebugInfoType);
      } catch (error) {
        console.error('Error fetching debug info:', error);
      } finally {
        setIsDebugLoading(false);
      }
    };
    
    const handleSignOut = async () => {
      try {
        await signOut({ redirect: false });
        // Wait a moment before redirecting
        setTimeout(() => {
          router.push("/auth/signin?callbackUrl=/admin/tags");
        }, 500);
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    return (
      <div className="flex min-h-screen flex-col">
        <AdminNav />
        
        <div className="container py-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-bold text-red-800 mb-2">Authentication Issue</h2>
            <div className="mb-4">
              <p className="text-red-700">
                Status: <span className="font-mono">{status}</span>
              </p>
              {session && (
                <p className="text-red-700">
                  Role: <span className="font-mono">{session.user.role || "no role"}</span>
                </p>
              )}
            </div>
            <p className="text-sm text-red-700 mb-2">
              You need to be logged in with an admin role to access this page.
            </p>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => router.push("/debug-session")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Debug Session
              </button>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Sign Out & Sign In Again
              </button>
              <button 
                onClick={fetchDebugInfo}
                disabled={isDebugLoading}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
              >
                {isDebugLoading ? 'Loading...' : 'Verify Database Role'}
              </button>
            </div>
            
            {debugInfo && (
              <div className="mt-4 p-4 bg-white rounded-md border border-gray-300">
                <h3 className="font-bold mb-2">Session Debug Info</h3>
                <div className="mb-2">
                  <p className="text-sm font-semibold">Session Role: <span className="font-mono">{debugInfo.session.user?.role || 'none'}</span></p>
                  <p className="text-sm font-semibold">Database Role: <span className="font-mono">{debugInfo.database.user?.role || 'none'}</span></p>
                  <p className="text-sm font-semibold">Mismatch: <span className="font-mono">{debugInfo.mismatch ? 'YES' : 'NO'}</span></p>
                </div>
                <p className="text-sm">{debugInfo.nextSteps}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tag Management</h1>
          
          {/* All dialogs are contained in this component */}
          <TagDialogs
            tags={tags}
            dialogs={dialogControls}
            onAddTag={handleAddTag}
            onUpdateTag={handleUpdateTag}
          />
        </div>
        
        {/* Tags Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Create and manage tags for categorizing study offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagsTable
              tags={tagRows}
              isLoading={isLoading}
              loadError={isError ? String(error) : null}
              retryLoad={refetch}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 