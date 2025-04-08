import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, Globe, Calendar, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudyOffer {
  _id: string;
  uniqueId?: string;
  title: string;
  universityName: string;
  description: string;
  location: string;
  degreeLevel: string;
  applicationDeadline: Date;
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  featured: boolean;
  tags: string[];
  color: string;
  accentColor: string;
}

interface OfferCardProps {
  offer: StudyOffer;
  viewMode: "grid" | "list";
}

export default function OfferCard({ offer, viewMode }: OfferCardProps) {
  // Format currency display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isGrid = viewMode === "grid";

  // Use the same card design for both modes, but adjust spacing
  return (
    <Card className={`overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-all ${isGrid ? "p-0" : "p-0"}`}>
      <CardHeader className={`p-4 ${offer.featured ? "bg-amber-50" : ""} border-b`}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="font-bold text-base line-clamp-2">{offer.title}</CardTitle>
            <div className="text-xs mt-1 font-medium">{offer.universityName}</div>
          </div>
          {offer.featured && (
            <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-700 text-xs px-2">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Program ID - if available */}
        {offer.uniqueId && (
          <div className="mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              {offer.uniqueId}
            </span>
          </div>
        )}
        
        {/* Basic Info Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs flex items-center gap-1 px-2 py-1">
            <BookOpen className="h-3 w-3" />
            {offer.degreeLevel}
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1 px-2 py-1">
            <Globe className="h-3 w-3" />
            {offer.location}
          </Badge>
        </div>
        
        {/* Description - with more space for grid view */}
        <p className={`text-xs text-muted-foreground mb-3 ${isGrid ? "line-clamp-3" : "line-clamp-2"}`}>
          {offer.description}
        </p>
        
        {/* Critical Info */}
        <div className="mt-auto space-y-2 text-xs mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span>
              Deadline: {format(new Date(offer.applicationDeadline), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span>
              Tuition: {formatCurrency(offer.tuitionFees.amount, offer.tuitionFees.currency)}/{offer.tuitionFees.period}
            </span>
          </div>
        </div>
        
        {/* View Button - improved styling to match the example */}
        <Link 
          href={`/offer/${offer._id}`} 
          className="block w-full text-center text-sm py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-sm transition-colors"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
} 