"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

// Import admin page layout
import { AdminPageLayout } from "@/components/ui/admin-page-layout";

// Import the offers table component
import { OffersTable, StudyOffer } from "@/app/components/tables/OffersTable";
import { TanStackOffersTable } from "@/app/components/tables/TanStackOffersTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudyOfferForm } from "../hooks/useStudyOfferForm";
import { useConfirm } from "@/app/hooks/useConfirm";
import { 
  useDeleteOffer,
  useGetOffers,
  useCreateUpdateOffer,
  useToggleOfferActive
} from "../hooks/useOffersQuery";

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
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [showEditOfferModal, setShowEditOfferModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<StudyOffer | null>(null);
  const [selectedRows, setSelectedRows] = useState<StudyOffer[]>([]);

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin/offers");
  }

  // Get data and mutations
  const { 
    data: offersData = [], 
    isLoading, 
    isError: getOffersError, 
    error: getOffersErrorDetails, 
    refetch 
  } = useGetOffers();
  
  const { 
    mutate: deleteOffer,
    isPending: isDeleting,
    variables: deletingId
  } = useDeleteOffer();
  
  const { mutate: toggleOfferActive } = useToggleOfferActive();
  const { mutate: createUpdateOffer, isPending: isSaving } = useCreateUpdateOffer();
  
  // Initialize form
  const { register, handleSubmit, setValue, reset, formState } = useStudyOfferForm();
  
  // Initialize confirmation dialogs
  const { confirm, ConfirmationDialog } = useConfirm();
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkStatusConfirm, setShowBulkStatusConfirm] = useState<{ active: boolean } | null>(null);

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

  // CRUD handlers
  const handleEditOffer = (id: string) => {
    const offer = offers.find((o) => o._id === id);
    if (offer) {
      setSelectedOffer(offer);
      setSelectedOfferId(id);
      
      // Set form values
      Object.keys(offer).forEach((key) => {
        // @ts-ignore - we're setting multiple form values dynamically
        setValue(key, offer[key]);
      });
      
      setShowEditOfferModal(true);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Offer",
      description: "Are you sure you want to delete this offer? This action cannot be undone.",
    });

    if (confirmed) {
      deleteOffer(id);
    }
  };

  const handleToggleActive = async (id: string) => {
    const offer = offers.find((o) => o._id === id);
    if (offer) {
      toggleOfferActive({ id, active: !offer.active });
    }
  };

  const handleViewOffer = (id: string) => {
    // TODO: Implement view offer page
    toast(`View offer ${id} - This feature is coming soon!`);
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    createUpdateOffer(
      { id: selectedOfferId, data },
      {
        onSuccess: () => {
          toast(selectedOfferId ? "Offer updated" : "Offer created");
          setShowNewOfferModal(false);
          setShowEditOfferModal(false);
          setSelectedOfferId(null);
          setSelectedOffer(null);
          reset();
        },
        onError: (err: Error) => {
          toast(`Failed to ${selectedOfferId ? "update" : "create"} offer: ${err.message}`);
        },
      }
    );
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    const ids = selectedRows.map((row) => row._id);
    
    // Delete offers one by one
    Promise.all(ids.map((id) => new Promise((resolve) => {
      deleteOffer(id, {
        onSettled: () => resolve(null)
      });
    })))
    .then(() => {
      toast(`${ids.length} offers deleted`);
      setSelectedRows([]);
    })
    .catch((err: Error) => {
      toast(`Failed to delete some offers: ${err.message}`);
    })
    .finally(() => {
      setShowBulkDeleteConfirm(false);
    });
  };

  const handleBulkToggleActive = (active: boolean) => {
    if (selectedRows.length === 0) return;
    setShowBulkStatusConfirm({ active });
  };

  const confirmBulkToggleActive = () => {
    if (!showBulkStatusConfirm) return;
    
    const active = showBulkStatusConfirm.active;
    const ids = selectedRows.map((row) => row._id);
    
    // Update status one by one
    Promise.all(ids.map((id) => new Promise((resolve) => {
      toggleOfferActive({ id, active }, {
        onSettled: () => resolve(null)
      });
    })))
    .then(() => {
      toast(`${ids.length} offers ${active ? 'activated' : 'deactivated'}`);
      setSelectedRows([]);
    })
    .catch((err: Error) => {
      toast(`Failed to update some offers: ${err.message}`);
    })
    .finally(() => {
      setShowBulkStatusConfirm(null);
    });
  };

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
        bulkActions={selectedRows.length > 0 ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkToggleActive(true)}
              className="mr-2"
            >
              Activate
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkToggleActive(false)}
              className="mr-2"
            >
              Deactivate
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
            <span className="ml-2 text-sm text-muted-foreground">
              {selectedRows.length} offer{selectedRows.length !== 1 ? 's' : ''} selected
            </span>
          </>
        ) : null}
      >
        <TanStackOffersTable
          data={filteredOffers}
          isLoading={isLoading}
          isError={getOffersError}
          error={getOffersErrorDetails}
          onEdit={handleEditOffer}
          onDelete={handleDeleteOffer}
          onView={handleViewOffer}
          refetch={refetch}
          globalFilter={searchQuery}
          onGlobalFilterChange={setSearchQuery}
          onSelectionChange={setSelectedRows}
          deletingId={deletingId}
        />
      </AdminPageLayout>
      <Toaster />

      {/* New/Edit Offer Modal */}
      {(showNewOfferModal || showEditOfferModal) && (
        <Dialog open={showNewOfferModal || showEditOfferModal} onOpenChange={() => {
          setShowNewOfferModal(false);
          setShowEditOfferModal(false);
        }}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>{selectedOfferId ? "Edit" : "Add"} Study Offer</DialogTitle>
              <DialogDescription>
                {selectedOfferId
                  ? "Update the details of this study offer"
                  : "Add a new study offer to the system"}
              </DialogDescription>
            </DialogHeader>
            
            {/* Form will be implemented separately */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Form fields here */}
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : selectedOfferId ? "Update" : "Add"} Offer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Offers</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRows.length} offer{selectedRows.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Change Confirmation Dialog */}
      <Dialog 
        open={!!showBulkStatusConfirm} 
        onOpenChange={() => setShowBulkStatusConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showBulkStatusConfirm?.active ? "Activate" : "Deactivate"} Multiple Offers
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {showBulkStatusConfirm?.active ? "activate" : "deactivate"} {selectedRows.length} offer{selectedRows.length !== 1 ? 's' : ''}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkStatusConfirm(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={confirmBulkToggleActive}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for single item operations */}
      <ConfirmationDialog />
    </>
  );
} 