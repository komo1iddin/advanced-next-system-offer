/**
 * Cache operations component
 * Handles operations like clearing cache, pattern clearing, and warmup
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlarmClock, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useClearCachePattern, useClearEntireCache, useWarmupCache } from "../hooks";
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

export function CacheOperations() {
  const { toast } = useToast();
  const [patternInput, setPatternInput] = useState<string>("");
  
  const clearEntireCacheMutation = useClearEntireCache();
  const clearCachePatternMutation = useClearCachePattern();
  const warmupCacheMutation = useWarmupCache();
  
  const handleClearEntireCache = async () => {
    try {
      await clearEntireCacheMutation.mutateAsync();
      
      toast({
        title: "Success",
        description: "Cache cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cache",
        variant: "destructive",
      });
    }
  };
  
  const handleClearPattern = async () => {
    if (!patternInput) {
      toast({
        title: "Error",
        description: "Please enter a pattern",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await clearCachePatternMutation.mutateAsync(patternInput);
      
      toast({
        title: "Success",
        description: `Pattern '${patternInput}' cleared successfully`,
      });
      
      setPatternInput("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear pattern",
        variant: "destructive",
      });
    }
  };
  
  const handleWarmupCache = async () => {
    try {
      await warmupCacheMutation.mutateAsync();
      
      toast({
        title: "Success",
        description: "Cache warmed up successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to warm up cache",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cache Operations</CardTitle>
          <CardDescription>
            Clear cache or clean up by pattern
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Entire Cache
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Entire Cache</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all cached data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearEntireCache}
                    disabled={clearEntireCacheMutation.isPending}
                  >
                    {clearEntireCacheMutation.isPending ? "Clearing..." : "Clear All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pattern">Clear by Pattern</Label>
            <div className="flex gap-2">
              <Input
                id="pattern"
                placeholder="e.g., user:*, products:*"
                value={patternInput}
                onChange={(e) => setPatternInput(e.target.value)}
              />
              <Button
                onClick={handleClearPattern}
                disabled={clearCachePatternMutation.isPending || !patternInput}
              >
                {clearCachePatternMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Clear"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use Redis pattern syntax, e.g., "user:*" will match all keys starting with "user:".
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cache Maintenance</CardTitle>
          <CardDescription>
            Warm up cache and perform maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cache Warmup</Label>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleWarmupCache}
              disabled={warmupCacheMutation.isPending}
            >
              {warmupCacheMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlarmClock className="mr-2 h-4 w-4" />
              )}
              {warmupCacheMutation.isPending ? "Warming Up..." : "Warm Up Cache"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Pre-populate the cache with commonly accessed data to improve performance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 