/**
 * Cache information component
 * Displays general information about the cache implementation
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, ToggleLeft, ToggleRight } from "lucide-react";
import { CacheStats, RedisInfo, TTLValues } from "../types";

interface CacheInfoProps {
  implementation: string;
  isRedisAvailable: boolean;
  stats: CacheStats;
  ttlValues: TTLValues;
  redisInfo: RedisInfo | null;
}

export function CacheInfo({
  implementation,
  isRedisAvailable,
  stats,
  ttlValues,
  redisInfo
}: CacheInfoProps) {
  // Function to parse Redis INFO command output
  const parseRedisInfo = (info: RedisInfo | null) => {
    if (!info) return {};
    
    // Redis info is typically a string with key-value pairs separated by colons
    const sections: Record<string, Record<string, string>> = {};
    let currentSection = "default";
    
    if (typeof info === "string") {
      const lines = info.split("\r\n");
      
      for (const line of lines) {
        // Section headers start with #
        if (line.startsWith("#")) {
          currentSection = line.substring(2).trim().toLowerCase();
          sections[currentSection] = {};
        } 
        // Key-value pairs are separated by colons
        else if (line.includes(":")) {
          const [key, value] = line.split(":", 2);
          if (sections[currentSection]) {
            sections[currentSection][key.trim()] = value.trim();
          }
        }
      }
    } else if (typeof info === "object") {
      // Handle case where info is already an object
      return info as Record<string, Record<string, string>>;
    }
    
    return sections;
  };
  
  const redisInfoParsed = parseRedisInfo(redisInfo);
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cache Implementation</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-2xl font-bold">
                {implementation.charAt(0).toUpperCase() + implementation.slice(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current cache implementation
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Redis Available:</span>
              {isRedisAvailable ? (
                <Badge className="bg-green-500">
                  <div className="flex items-center gap-1">
                    <ToggleRight className="h-3 w-3" />
                    <span>Yes</span>
                  </div>
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <div className="flex items-center gap-1">
                    <ToggleLeft className="h-3 w-3" />
                    <span>No</span>
                  </div>
                </Badge>
              )}
            </div>
            
            <div>
              <div className="text-sm font-semibold">TTL Values (seconds)</div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Short</TableCell>
                    <TableCell>{ttlValues.short} ({(ttlValues.short / 60).toFixed(1)} minutes)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Medium</TableCell>
                    <TableCell>{ttlValues.medium} ({(ttlValues.medium / 60).toFixed(1)} minutes)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Long</TableCell>
                    <TableCell>{ttlValues.long} ({(ttlValues.long / 3600).toFixed(1)} hours)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Day</TableCell>
                    <TableCell>{ttlValues.day} ({(ttlValues.day / 3600).toFixed(1)} hours)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
  
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cache Statistics</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {implementation === "redis" && isRedisAvailable ? (
              <div className="space-y-2">
                {/* Show Redis stats */}
                {stats.hits !== undefined && stats.misses !== undefined && (
                  <div>
                    <div className="text-lg font-semibold">Hit Ratio</div>
                    <div className="text-2xl font-bold">
                      {stats.hits + stats.misses > 0
                        ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)
                        : "0"}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.hits} hits, {stats.misses} misses
                    </p>
                  </div>
                )}
  
                {/* Only show the most important Redis stats */}
                <div>
                  <div className="text-sm font-semibold mt-2">Redis Server Info</div>
                  <Table>
                    <TableBody className="text-sm">
                      {/* Memory */}
                      {redisInfoParsed.memory?.used_memory_human && (
                        <TableRow>
                          <TableCell className="font-medium">Memory Usage</TableCell>
                          <TableCell>{redisInfoParsed.memory.used_memory_human}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Clients */}
                      {redisInfoParsed.clients?.connected_clients && (
                        <TableRow>
                          <TableCell className="font-medium">Connected Clients</TableCell>
                          <TableCell>{redisInfoParsed.clients.connected_clients}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Server */}
                      {redisInfoParsed.server?.redis_version && (
                        <TableRow>
                          <TableCell className="font-medium">Redis Version</TableCell>
                          <TableCell>{redisInfoParsed.server.redis_version}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Uptime */}
                      {redisInfoParsed.server?.uptime_in_days && (
                        <TableRow>
                          <TableCell className="font-medium">Uptime</TableCell>
                          <TableCell>{redisInfoParsed.server.uptime_in_days} days</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Keyspace */}
                      {redisInfoParsed.keyspace?.db0 && (
                        <TableRow>
                          <TableCell className="font-medium">Keys</TableCell>
                          <TableCell>
                            {typeof redisInfoParsed.keyspace.db0 === 'string' 
                              ? redisInfoParsed.keyspace.db0.split(",")[0].split("=")[1]
                              : redisInfoParsed.keyspace.db0}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">
                  Statistics not available for {implementation} implementation.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 