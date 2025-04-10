"use client";

import { useEffect, useState } from "react";
import { AdminPageLayout } from "@/components/ui/admin/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Database,
  Trash2,
  AlarmClock,
  FileSearch,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";

// Types
interface CacheStats {
  hits?: number;
  misses?: number;
  sets?: number;
  evictions?: number;
  [key: string]: any;
}

interface RedisInfo {
  [key: string]: any;
}

interface TTLValues {
  short: number;
  medium: number;
  long: number;
  day: number;
}

interface CacheKey {
  key: string;
  value: any;
  ttl: number;
}

export default function CacheManagementPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<CacheStats>({});
  const [implementation, setImplementation] = useState<string>("loading...");
  const [isRedisAvailable, setIsRedisAvailable] = useState<boolean>(false);
  const [redisInfo, setRedisInfo] = useState<RedisInfo | null>(null);
  const [ttlValues, setTtlValues] = useState<TTLValues>({
    short: 300,
    medium: 1800,
    long: 7200,
    day: 86400,
  });

  // Search states
  const [patternInput, setPatternInput] = useState<string>("");
  const [keyInput, setKeyInput] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<CacheKey | null>(null);
  const [newTtl, setNewTtl] = useState<string>("");

  // Load cache information on component mount
  useEffect(() => {
    fetchCacheInfo();
  }, []);

  // Fetch cache information from API
  const fetchCacheInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cache");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats || {});
        setImplementation(data.implementation || "unknown");
        setIsRedisAvailable(data.isRedisAvailable || false);
        setRedisInfo(data.redisInfo || null);
        setTtlValues(data.ttlValues || ttlValues);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch cache information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch cache info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cache information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cache
  const clearEntireCache = async () => {
    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear",
          type: "all",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Cache cleared successfully",
        });
        fetchCacheInfo();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to clear cache",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  // Clear cache pattern
  const clearCachePattern = async () => {
    if (!patternInput) {
      toast({
        title: "Error",
        description: "Please enter a pattern",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear",
          type: "pattern",
          pattern: patternInput,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Pattern cleared successfully",
        });
        setPatternInput("");
        fetchCacheInfo();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to clear pattern",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to clear pattern:", error);
      toast({
        title: "Error",
        description: "Failed to clear pattern",
        variant: "destructive",
      });
    }
  };

  // Get cache key
  const getCacheKey = async () => {
    if (!keyInput) {
      toast({
        title: "Error",
        description: "Please enter a key",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get",
          key: keyInput,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedKey({
          key: data.key,
          value: data.value,
          ttl: data.ttl,
        });
        setNewTtl(data.ttl.toString());
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to get key:", error);
      toast({
        title: "Error",
        description: "Failed to get key",
        variant: "destructive",
      });
    }
  };

  // Delete cache key
  const deleteCacheKey = async () => {
    if (!selectedKey) return;

    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          key: selectedKey.key,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Key deleted successfully",
        });
        setSelectedKey(null);
        setKeyInput("");
        fetchCacheInfo();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete key:", error);
      toast({
        title: "Error",
        description: "Failed to delete key",
        variant: "destructive",
      });
    }
  };

  // Update TTL
  const updateTTL = async () => {
    if (!selectedKey || !newTtl) return;

    try {
      const ttl = parseInt(newTtl);
      if (isNaN(ttl) || ttl <= 0) {
        toast({
          title: "Error",
          description: "TTL must be a positive number",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateTTL",
          key: selectedKey.key,
          ttl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "TTL updated successfully",
        });
        getCacheKey(); // Refresh the key information
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update TTL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update TTL:", error);
      toast({
        title: "Error",
        description: "Failed to update TTL",
        variant: "destructive",
      });
    }
  };

  // Warm cache
  const warmCache = async () => {
    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "warmup",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Cache warmup initiated successfully",
        });
        fetchCacheInfo();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to warm cache",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to warm cache:", error);
      toast({
        title: "Error",
        description: "Failed to warm cache",
        variant: "destructive",
      });
    }
  };

  // Format seconds to human-readable time
  const formatTTL = (seconds: number): string => {
    if (seconds <= 0) return "No expiration";
    
    if (seconds < 60) return `${seconds} seconds`;
    
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  return (
    <AdminPageLayout
      title="Cache Management"
      description="Monitor and manage your application's Redis cache"
      breadcrumbs={[{ title: "Cache Management", href: "/admin/cache" }]}
    >
      <div className="space-y-6">
        {/* Cache Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Cache Status
                </CardTitle>
                <CardDescription>
                  View the current cache implementation status
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCacheInfo}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Implementation
                </div>
                <div className="flex items-center gap-2">
                  {isRedisAvailable ? (
                    <ToggleRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="text-lg font-semibold capitalize">
                    {implementation}
                  </span>
                </div>
              </div>

              {/* Redis Status */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Redis Status
                </div>
                <div className="flex items-center gap-2">
                  {isRedisAvailable ? (
                    <>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                        Connected
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                        Disconnected
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Cache Hit Rate */}
              {stats.hits !== undefined && stats.misses !== undefined && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Hit Rate
                  </div>
                  <div className="text-lg font-semibold">
                    {stats.hits + stats.misses === 0
                      ? "0%"
                      : `${Math.round(
                          (stats.hits / (stats.hits + stats.misses)) * 100
                        )}%`}
                  </div>
                </div>
              )}

              {/* Cache Size */}
              {stats.keys !== undefined && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Cache Keys
                  </div>
                  <div className="text-lg font-semibold">{stats.keys}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cache Operations Tabs */}
        <Tabs defaultValue="clear" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="clear">Clear Cache</TabsTrigger>
            <TabsTrigger value="keys">Manage Keys</TabsTrigger>
            <TabsTrigger value="warmup">Cache Warmup</TabsTrigger>
          </TabsList>

          {/* Clear Cache Tab */}
          <TabsContent value="clear" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Clear Cache</CardTitle>
                <CardDescription>
                  Remove items from the cache to ensure fresh data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 p-4 rounded-md text-sm">
                  <p className="font-semibold">Warning</p>
                  <p className="mt-1">
                    Clearing the cache may temporarily impact performance until
                    the cache is rebuilt. Use this feature with caution.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Clear All Cache */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Clear Entire Cache</CardTitle>
                      <CardDescription>
                        Remove all cached items from the Redis server
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Cache
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete all cached data and may temporarily impact
                              application performance. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={clearEntireCache}>
                              Clear Cache
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>

                  {/* Clear by Pattern */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Clear by Pattern</CardTitle>
                      <CardDescription>
                        Remove cache items matching a specific pattern
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="e.g., study_offer:* or user_profile:*"
                          value={patternInput}
                          onChange={(e) => setPatternInput(e.target.value)}
                        />
                        <Button onClick={clearCachePattern}>Clear</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Keys Tab */}
          <TabsContent value="keys" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Cache Keys</CardTitle>
                <CardDescription>
                  View, update, and delete specific cache keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter cache key"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                  />
                  <Button onClick={getCacheKey}>
                    <FileSearch className="h-4 w-4 mr-2" />
                    Get Key
                  </Button>
                </div>

                {selectedKey && (
                  <Card className="mt-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="font-mono text-sm">{selectedKey.key}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={deleteCacheKey}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        TTL: {formatTTL(selectedKey.ttl)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Update TTL */}
                        <div className="space-y-2">
                          <Label htmlFor="ttl">Update TTL (seconds)</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="ttl"
                              type="number"
                              value={newTtl}
                              onChange={(e) => setNewTtl(e.target.value)}
                            />
                            <Button onClick={updateTTL}>
                              <AlarmClock className="h-4 w-4 mr-2" />
                              Update
                            </Button>
                          </div>
                        </div>

                        {/* Value Preview */}
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <div className="bg-muted p-2 rounded-md overflow-auto max-h-48">
                            <pre className="text-xs">
                              {JSON.stringify(selectedKey.value, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cache Warmup Tab */}
          <TabsContent value="warmup" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Warmup</CardTitle>
                <CardDescription>
                  Prefetch commonly accessed data to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-4 rounded-md text-sm">
                  <p className="font-semibold">Cache Warmup</p>
                  <p className="mt-1">
                    Initiating cache warmup will prefetch common study offers and
                    frequently accessed data. This operation runs in the background
                    and may take a few moments to complete.
                  </p>
                </div>

                <Button onClick={warmCache}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Warm Cache
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* TTL Settings */}
        <Card>
          <CardHeader>
            <CardTitle>TTL Settings</CardTitle>
            <CardDescription>
              Time-to-live settings for different cache types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                All times are in seconds. These values are defined in your .env file.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>TTL Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Human Readable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Short</TableCell>
                  <TableCell>{ttlValues.short}</TableCell>
                  <TableCell>{formatTTL(ttlValues.short)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Medium</TableCell>
                  <TableCell>{ttlValues.medium}</TableCell>
                  <TableCell>{formatTTL(ttlValues.medium)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Long</TableCell>
                  <TableCell>{ttlValues.long}</TableCell>
                  <TableCell>{formatTTL(ttlValues.long)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>{ttlValues.day}</TableCell>
                  <TableCell>{formatTTL(ttlValues.day)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
} 