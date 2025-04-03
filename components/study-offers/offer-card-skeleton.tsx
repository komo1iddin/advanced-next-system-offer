import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OfferCardSkeletonProps {
  viewMode: "grid" | "list";
}

export default function OfferCardSkeleton({ viewMode }: OfferCardSkeletonProps) {
  const isGrid = viewMode === "grid";
  
  // Use same skeleton for both modes with improved spacing
  return (
    <Card className="overflow-hidden flex flex-col h-full shadow-sm">
      <CardHeader className="p-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4 flex-1">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          {isGrid && <Skeleton className="h-4 w-full" />}
        </div>
        
        <div className="space-y-2 mt-auto mb-4">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
} 