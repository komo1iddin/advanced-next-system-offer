"use client";

import { AdminPageLayout } from "@/components/ui/admin/page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CacheInfo, CacheKeyExplorer, CacheOperations } from "./components";
import { useCacheInfo } from "./hooks";
import { Button } from "@/components/ui/button";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Cache Management Page
 * Wrapper component with QueryClientProvider
 */
export default function CacheManagementPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheManagement />
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

/**
 * Cache Management Component with React Query
 */
function CacheManagement() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { data, isLoading, isError, error, refetch } = useCacheInfo();
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <AdminPageLayout
      title="Cache Management"
      description="Monitor and manage application cache"
      actionButton={
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      }
    >
      {isError ? (
        <div className="bg-destructive/10 p-4 rounded-md">
          <h3 className="text-destructive font-medium">Error</h3>
          <p className="text-destructive/80">
            {error instanceof Error ? error.message : "Failed to fetch cache information"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {data && (
                <CacheInfo
                  implementation={data.implementation || "unknown"}
                  isRedisAvailable={data.isRedisAvailable || false}
                  stats={data.stats || {}}
                  ttlValues={data.ttlValues || {
                    short: 300,
                    medium: 1800,
                    long: 7200,
                    day: 86400,
                  }}
                  redisInfo={data.redisInfo}
                />
              )}
              
              <Tabs
                defaultValue="operations"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="operations">Cache Operations</TabsTrigger>
                  <TabsTrigger value="explorer">Key Explorer</TabsTrigger>
                </TabsList>
                <TabsContent value="operations" className="mt-6">
                  <CacheOperations />
                </TabsContent>
                <TabsContent value="explorer" className="mt-6">
                  <CacheKeyExplorer />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
} 