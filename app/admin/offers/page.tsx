"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

// Import the offers table component
import { OffersTable, StudyOffer } from "@/app/components/tables/OffersTable";

export default function AdminOffersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [offers, setOffers] = useState<StudyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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
  const fetchOffers = async () => {
    try {
      setLoading(true);
      setIsError(false);
      const response = await fetch('/api/study-offers?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch study offers');
      }
      
      const data = await response.json();
      setOffers(data.data);
      setFilteredOffers(data.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setIsError(true);
      setError(error instanceof Error ? error : new Error('Failed to load study offers'));
      toast({
        title: "Error",
        description: "Failed to load study offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      offer.category.toLowerCase().includes(query) ||
      (offer.uniqueId && offer.uniqueId.toLowerCase().includes(query))
    );
    
    setFilteredOffers(filtered);
  }, [searchQuery, offers]);

  // Handle delete offer
  const handleDelete = async (id: string) => {
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

  // Handle edit
  const handleEdit = (id: string) => {
    router.push(`/admin/edit-offer/${id}`);
  };

  // Handle view
  const handleView = (id: string) => {
    router.push(`/offer/${id}`);
  };

  // Action button for the header
  const actionButton = (
    <Button onClick={() => router.push("/admin/add-offer")}>
      <Plus className="mr-2 h-4 w-4" />
      Add New Offer
    </Button>
  );

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <AdminPageLayout
        title="Manage Study Offers"
        description="View, edit, and delete study offers"
        actionButton={actionButton}
        cardTitle="All Study Offers"
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        itemCount={filteredOffers.length}
        itemName="offer"
      >
        <OffersTable
          offers={filteredOffers}
          isLoading={loading}
          isError={isError}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          refetch={fetchOffers}
          deletingId={deleting}
        />
      </AdminPageLayout>
      <Toaster />
    </>
  );
} 