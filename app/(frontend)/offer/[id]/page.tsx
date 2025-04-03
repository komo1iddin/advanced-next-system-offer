"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Tag, Calendar, Clock, School, Globe, BookOpen, Coins, Check, Download, Share, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Offer {
  _id: string;
  title: string;
  universityName: string;
  description: string;
  location: string;
  degreeLevel: string;
  programs: string[];
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  applicationDeadline: Date;
  languageRequirements: {
    language: string;
    minimumScore?: string;
    testName?: string;
  }[];
  durationInYears: number;
  campusFacilities: string[];
  admissionRequirements: string[];
  tags: string[];
  color: string;
  accentColor: string;
  category: string;
  images?: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Format currency display
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function StudyOfferDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [offer, setOffer] = useState<Offer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [relatedOffers, setRelatedOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch offer from API
  useEffect(() => {
    async function fetchOffer() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/study-offers/${id}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch offer details")
        }
        
        const { data } = await response.json()
        setOffer(data)
        
        // Fetch related offers
        const relatedResponse = await fetch(`/api/study-offers?limit=3`)
        if (!relatedResponse.ok) {
          throw new Error("Failed to fetch related offers")
        }
        
        const { data: relatedData } = await relatedResponse.json()
        // Filter out the current offer and limit to 3
        setRelatedOffers(relatedData.filter((o: Offer) => o._id !== id).slice(0, 3))
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load offer details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchOffer()
  }, [id])

  // Handle delete offer
  const handleDeleteOffer = async () => {
    try {
      const response = await fetch(`/api/study-offers/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete offer")
      }
      
      toast({
        title: "Success",
        description: "Study offer has been deleted",
      })
      
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete offer",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Offers
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-6 items-center justify-center py-12">
          <h1 className="text-xl font-medium text-destructive">
            {error || 'Offer not found'}
          </h1>
          <Button asChild>
            <Link href="/">Back to Offers</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Offers
        </Button>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column (main content) */}
          <div className="md:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader className={`${offer.featured ? "bg-amber-50" : ""}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{offer.title}</CardTitle>
                    <div className="text-lg mt-1 text-muted-foreground">{offer.universityName}</div>
                  </div>
                  {offer.featured && (
                    <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-700">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {offer.degreeLevel}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {offer.location}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(offer.applicationDeadline), 'MMM d, yyyy')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="whitespace-pre-line">{offer.description}</p>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {offer.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Details Accordion */}
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="programs">
                    <AccordionTrigger>Available Programs</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {offer.programs.map((program: string) => (
                          <Badge key={program} variant="outline">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {offer.scholarshipAvailable && offer.scholarshipDetails && (
                    <AccordionItem value="scholarship">
                      <AccordionTrigger>Scholarship Details</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm">{offer.scholarshipDetails}</p>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  <AccordionItem value="language">
                    <AccordionTrigger>Language Requirements</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {offer.languageRequirements.map((req: any, i: number) => (
                          <li key={i}>
                            {req.language}
                            {req.testName && req.minimumScore && `: ${req.testName} (${req.minimumScore})`}
                            {req.testName && !req.minimumScore && `: ${req.testName}`}
                            {!req.testName && req.minimumScore && `: ${req.minimumScore}`}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="admission">
                    <AccordionTrigger>Admission Requirements</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {offer.admissionRequirements.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {offer.campusFacilities && offer.campusFacilities.length > 0 && (
                    <AccordionItem value="facilities">
                      <AccordionTrigger>Campus Facilities</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {offer.campusFacilities.map((facility: string, i: number) => (
                            <li key={i}>{facility}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column (sidebar) */}
          <div className="space-y-6">
            {/* Key Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tuition Fees:</span>
                  <span className="font-semibold">
                    {formatCurrency(offer.tuitionFees.amount, offer.tuitionFees.currency)}/{offer.tuitionFees.period}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Program Duration:</span>
                  <span>{offer.durationInYears} {offer.durationInYears > 1 ? 'years' : 'year'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Application Deadline:</span>
                  <span>{format(new Date(offer.applicationDeadline), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scholarship:</span>
                  <Badge variant={offer.scholarshipAvailable ? "default" : "outline"} className={offer.scholarshipAvailable ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                    {offer.scholarshipAvailable ? "Available" : "Not Available"}
                  </Badge>
                </div>
                
                {/* Apply Button */}
                <Button className="w-full mt-6">
                  Apply for This Program
                </Button>
              </CardContent>
            </Card>
            
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Brochure
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Share className="h-4 w-4" />
                  Share This Offer
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Star className="h-4 w-4" />
                  Save to Favorites
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this study offer from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOffer} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

