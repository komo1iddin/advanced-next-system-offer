"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Info, LayoutGrid, List, ChevronLeft, ChevronRight, Filter, Layers, School, BookOpen, Globe, Calendar, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useStudyOffers } from "@/hooks/use-study-offers"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import OfferCard from "@/components/study-offers/offer-card"
import OfferCardSkeleton from "@/components/study-offers/offer-card-skeleton"

// Color options for cards - solid colors instead of gradients
const cardColors = [
  { bg: "bg-rose-50", accent: "border-rose-200 text-rose-600" },
  { bg: "bg-blue-50", accent: "border-blue-200 text-blue-600" },
  { bg: "bg-amber-50", accent: "border-amber-200 text-amber-600" },
  { bg: "bg-emerald-50", accent: "border-emerald-200 text-emerald-600" },
  { bg: "bg-violet-50", accent: "border-violet-200 text-violet-600" },
  { bg: "bg-orange-50", accent: "border-orange-200 text-orange-600" },
]

// Available categories with icons
const categories = [
  { name: "Bachelor", icon: "🎓" },
  { name: "Master", icon: "📚" },
  { name: "PhD", icon: "🔬" },
  { name: "Certificate", icon: "📜" },
  { name: "Diploma", icon: "🎯" },
  { name: "Language Course", icon: "🗣️" },
]

// Degree levels
const degreeLevels = ["Bachelor", "Master", "PhD", "Certificate", "Diploma", "Language Course"]

export default function StudyOffersPage() {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Search state with simple state
  const [searchInput, setSearchInput] = useState("");
  
  // Use our custom hook to fetch and manage study offers
  const {
    offers,
    loading,
    error,
    pagination,
    category,
    setCategory,
    degreeLevel,
    setDegreeLevel,
    searchQuery,
    setSearchQuery,
    featured,
    setFeatured,
    page,
    setPage,
    limit,
    setLimit,
    refetch
  } = useStudyOffers();

  // Selected tags for filtering
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Sort option
  const [sortOption, setSortOption] = useState("default")
  
  // Filter sheet state (mobile)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // View mode (grid or list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  
  // Use the debounce hook to debounce searchInput changes
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  
  // Apply the debounced search term to the API query
  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);
  
  // Initialize searchInput with any existing searchQuery on mount
  useEffect(() => {
    if (searchQuery) {
      setSearchInput(searchQuery);
    }
  }, []);

  // Get all unique tags from offers using useMemo for better performance
  const allTags = useMemo(() => {
    return Array.from(new Set(offers.flatMap((offer) => offer.tags)));
  }, [offers]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput);
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPage(newPage)
    }
  }

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Format currency display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Memoize the offers grid/list to prevent unnecessary re-renders
  const renderedOffers = useMemo(() => {
    if (loading) {
      return Array(8).fill(0).map((_, i) => (
        <OfferCardSkeleton key={i} viewMode={viewMode} />
      ));
    }
    
    if (error || offers.length === 0) {
      return null;
    }
    
    return offers.map((offer) => (
      <OfferCard key={offer._id} offer={offer} viewMode={viewMode} />
    ));
  }, [offers, loading, error, viewMode]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Study in China</h1>
          <p className="text-muted-foreground">
            Discover study opportunities at top Chinese universities
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search universities, programs..."
              className="pl-8 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category filter for desktop */}
            {!isMobile && (
              <Select value={degreeLevel || "all"} onValueChange={(value) => setDegreeLevel(value === "all" ? null : value)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Degree Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degree Levels</SelectItem>
                  {degreeLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort options */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="deadline-asc">Deadline (Earliest)</SelectItem>
                <SelectItem value="deadline-desc">Deadline (Latest)</SelectItem>
                <SelectItem value="tuition-asc">Tuition (Low to High)</SelectItem>
                <SelectItem value="tuition-desc">Tuition (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile filter button */}
            {isMobile && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filter Study Offers</SheetTitle>
                    <SheetDescription>
                      Filter offers by category, degree level, and more
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6">
                    {/* Mobile Degree Level Filter */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Degree Level</h3>
                      <div className="space-y-1">
                        <Checkbox 
                          id="all-degrees" 
                          checked={!degreeLevel}
                          onCheckedChange={() => setDegreeLevel(null)}
                        />
                        <label htmlFor="all-degrees" className="ml-2 text-sm">
                          All Degree Levels
                        </label>
                      </div>
                      {degreeLevels.map((level) => (
                        <div key={level} className="space-y-1">
                          <Checkbox 
                            id={`degree-${level}`} 
                            checked={degreeLevel === level}
                            onCheckedChange={() => setDegreeLevel(level)}
                          />
                          <label htmlFor={`degree-${level}`} className="ml-2 text-sm">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Featured Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="featured" 
                          checked={featured}
                          onCheckedChange={(checked) => setFeatured(!!checked)}
                        />
                        <label htmlFor="featured" className="text-sm font-medium">
                          Featured offers only
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTags([]);
                          setFeatured(false);
                          setDegreeLevel(null);
                          setIsFilterOpen(false);
                        }}
                      >
                        Reset Filters
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* View mode toggle */}
            <div className="border rounded-lg flex items-center p-1 ml-2">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-2 rounded-md ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-2 rounded-md ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Add new offer button */}
            <Button asChild className="ml-auto">
              <Link href="/add-offer">
                Add Study Offer
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Tag Filters */}
        {!isMobile && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Tags:</span>
            {allTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
            {allTags.length > 10 && (
              <Button variant="ghost" size="sm">
                +{allTags.length - 10} more
              </Button>
            )}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium text-destructive">Error loading study offers</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && offers.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <School className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium mt-4">No study offers found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
            <Button onClick={() => {
              setSearchInput("");
              setSelectedTags([]);
              setFeatured(false);
              setDegreeLevel(null);
              setPage(1);
            }} variant="outline" className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}

        {/* Study Offers Grid/List */}
        <div className={`grid ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 auto-rows-fr gap-6" 
            : "grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 auto-rows-auto gap-4"
        }`}>
          {renderedOffers}
        </div>

        {/* Pagination */}
        {!loading && !error && offers.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

