"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Search, Trash2, LayoutGrid, ExternalLink, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface StudyOffer {
  _id: string;
  title: string;
  universityName: string;
  degreeLevel: string;
  category: string;
  location: string;
  featured: boolean;
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  createdAt: string;
}

export default function AdminOffersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [offers, setOffers] = useState<StudyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOffers, setFilteredOffers] = useState<StudyOffer[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin/offers");
  }

  // Fetch all study offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/study-offers?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch study offers');
        }
        
        const data = await response.json();
        setOffers(data.data);
        setFilteredOffers(data.data);
      } catch (error) {
        console.error('Error fetching offers:', error);
        toast({
          title: "Error",
          description: "Failed to load study offers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchOffers();
    }
  }, [status]);

  // Filter offers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOffers(offers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = offers.filter(offer => 
      offer.title.toLowerCase().includes(query) ||
      offer.universityName.toLowerCase().includes(query) ||
      offer.location.toLowerCase().includes(query) ||
      offer.category.toLowerCase().includes(query)
    );
    
    setFilteredOffers(filtered);
  }, [searchQuery, offers]);

  // Handle delete offer
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study offer? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(id);
      
      const response = await fetch(`/api/study-offers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete study offer');
      }
      
      // Remove the deleted offer from state
      setOffers(offers.filter(offer => offer._id !== id));
      setFilteredOffers(filteredOffers.filter(offer => offer._id !== id));
      
      toast({
        title: "Success",
        description: "Study offer has been deleted successfully",
      });
      
    } catch (error) {
      console.error('Error deleting study offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete study offer",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Manage Study Offers
                </CardTitle>
                <CardDescription>
                  View, edit, and delete study offers
                </CardDescription>
              </div>
              <Button onClick={() => router.push("/admin/add-offer")} className="md:w-auto w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Offer
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search offers by title, university, or location..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredOffers.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  {searchQuery ? "No matching offers found" : "No study offers available"}
                </p>
              </div>
            )}

            <div className="relative overflow-x-auto border rounded-md">
              {filteredOffers.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">University</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">Location</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">Degree</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">Tuition</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOffers.map((offer) => (
                      <tr key={offer._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 align-middle">
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {offer.universityName}, {offer.location}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">{offer.universityName}</td>
                        <td className="px-4 py-3 align-middle hidden md:table-cell">{offer.location}</td>
                        <td className="px-4 py-3 align-middle hidden md:table-cell">{offer.degreeLevel}</td>
                        <td className="px-4 py-3 align-middle hidden md:table-cell">
                          {offer.tuitionFees.amount} {offer.tuitionFees.currency}/{offer.tuitionFees.period}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/edit-offer/${offer._id}`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(offer._id)}
                              disabled={deleting === offer._id}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/offer/${offer._id}`)}
                              title="View"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <Toaster />
      </div>
    </div>
  );
} 