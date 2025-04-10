/**
 * Cache key explorer component
 * Allows exploring and manipulating individual cache keys
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileSearch, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteCacheKey, useGetCacheKey, useUpdateTTL } from "../hooks";
import { CacheKey } from "../types";
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

export function CacheKeyExplorer() {
  const { toast } = useToast();
  const [keyInput, setKeyInput] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<CacheKey | null>(null);
  const [newTtl, setNewTtl] = useState<string>("");
  
  const getCacheKeyMutation = useGetCacheKey();
  const deleteCacheKeyMutation = useDeleteCacheKey();
  const updateTTLMutation = useUpdateTTL();
  
  const handleGetKey = async () => {
    if (!keyInput) {
      toast({
        title: "Error",
        description: "Please enter a key",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const data = await getCacheKeyMutation.mutateAsync(keyInput);
      
      if (data.success) {
        setSelectedKey({
          key: data.key || "",
          value: data.value,
          ttl: data.ttl || -1,
          exists: data.exists || false,
        });
        
        // Set initial TTL value for the input
        setNewTtl(data.ttl?.toString() || "");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get key",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteKey = async () => {
    if (!selectedKey) return;
    
    try {
      await deleteCacheKeyMutation.mutateAsync(selectedKey.key);
      
      toast({
        title: "Success",
        description: `Key '${selectedKey.key}' deleted successfully`,
      });
      
      // Reset the selected key
      setSelectedKey(null);
      setKeyInput("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete key",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateTTL = async () => {
    if (!selectedKey) return;
    
    const ttl = parseInt(newTtl, 10);
    
    if (isNaN(ttl) || ttl <= 0) {
      toast({
        title: "Error",
        description: "TTL must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateTTLMutation.mutateAsync({ key: selectedKey.key, ttl });
      
      toast({
        title: "Success",
        description: `TTL for key '${selectedKey.key}' updated to ${ttl} seconds`,
      });
      
      // Update the selected key with the new TTL
      setSelectedKey({
        ...selectedKey,
        ttl,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update TTL",
        variant: "destructive",
      });
    }
  };
  
  const formatTTL = (seconds: number): string => {
    if (seconds < 0) return "No expiry";
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
    return `${(seconds / 86400).toFixed(1)} days`;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cache Key Explorer</CardTitle>
          <CardDescription>
            Look up individual keys in the cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <div className="flex gap-2">
              <Input
                id="key"
                placeholder="Enter cache key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGetKey();
                  }
                }}
              />
              <Button
                onClick={handleGetKey}
                disabled={getCacheKeyMutation.isPending || !keyInput}
              >
                {getCacheKeyMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSearch className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedKey && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Key Details</CardTitle>
                <CardDescription>
                  {selectedKey.key}
                </CardDescription>
              </div>
              <div>
                {selectedKey.exists && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Cache Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the key '{selectedKey.key}'? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteKey}
                          disabled={deleteCacheKeyMutation.isPending}
                        >
                          {deleteCacheKeyMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedKey.exists ? (
              <>
                <div className="space-y-2">
                  <Label>TTL</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm">
                      Current: {formatTTL(selectedKey.ttl)}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="New TTL (seconds)"
                        value={newTtl}
                        onChange={(e) => setNewTtl(e.target.value)}
                        className="w-32"
                      />
                      <Button
                        onClick={handleUpdateTTL}
                        disabled={updateTTLMutation.isPending || newTtl === "" || isNaN(parseInt(newTtl, 10))}
                        size="sm"
                      >
                        {updateTTLMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Value</Label>
                  <div className="p-4 bg-muted rounded-md">
                    <pre className="text-sm overflow-auto max-h-80">
                      {typeof selectedKey.value === "object"
                        ? JSON.stringify(selectedKey.value, null, 2)
                        : selectedKey.value?.toString()}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Key does not exist in the cache</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 