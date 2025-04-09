import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Tag,
  fetchTags,
  addTag,
  updateTag,
  deleteTag
} from "../lib/tag-service";
import { TagRow, processTagsForTable } from "../lib/utils";

// Maximum number of retries for loading data
const MAX_RETRIES = 2;

export function useTagManager() {
  // Data states
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagRows, setTagRows] = useState<TagRow[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  
  // Submission state
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  
  // Error state
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if data is being loaded to prevent duplicate requests
  const isLoadingRef = useRef(false);

  const { toast } = useToast();

  // Add effect for cleanup
  useEffect(() => {
    // Force a fresh data load when the component mounts
    console.log("Tags component mounted - forcing fresh data load");
    
    // Reset all state to initial values
    setTags([]);
    setTagRows([]);
    setLoadError(null);
    setRetryCount(0);
    isLoadingRef.current = false;
    
    // Load fresh data
    loadData();
    
    return () => {
      console.log("Tags component unmounted - cleaning up");
      isMounted.current = false;
    };
  }, []); // Empty deps array ensures this only runs once on mount

  // Separate update effect
  useEffect(() => {
    setTagRows(processTagsForTable(tags));
  }, [tags]);

  // Load all tag data
  const loadData = useCallback(async (retry = false) => {
    // Reset retry count when loading is explicitly requested (not from a retry)
    if (!retry) {
      setRetryCount(0);
    }
    
    // If we've exceeded max retries, don't try again
    if (retry && retryCount >= MAX_RETRIES) {
      console.log(`Maximum retries (${MAX_RETRIES}) exceeded. Giving up.`);
      return;
    }
    
    // Prevent duplicate loading
    if (isLoadingRef.current) {
      console.log("Already loading tags, skipping redundant request");
      return;
    }
    
    // Reset error state
    setLoadError(null);
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Fetching tags data... ${retry ? `(retry ${retryCount + 1}/${MAX_RETRIES})` : ''}`);
      
      const tagsData = await fetchTags();
      console.log("Tags data received:", tagsData);
      
      if (isMounted.current) {
        setTags(tagsData || []); // Ensure we always set an array even if response is null
        // Tag rows will be updated in the effect
      }
    } catch (error) {
      console.error("Error in loadData:", error);
      
      if (isMounted.current) {
        // Set empty array to prevent infinite loading
        setTags([]);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unknown error occurred';
        
        setLoadError(errorMessage);
        
        // Increment retry count if this was a retry
        if (retry) {
          setRetryCount(prev => prev + 1);
        }
        
        // Show toast only on first error or explicit load request
        if (!retry || retryCount === 0) {
          toast({
            title: "Error",
            description: "Failed to load tags. Retrying...",
            variant: "destructive",
          });
        }
        
        // Auto-retry with exponential backoff if under max retries
        if ((retry || retryCount === 0) && retryCount < MAX_RETRIES) {
          const backoffTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Scheduling retry in ${backoffTime}ms`);
          
          setTimeout(() => {
            if (isMounted.current) {
              loadData(true);
            }
          }, backoffTime);
        } else if (retryCount >= MAX_RETRIES) {
          toast({
            title: "Error",
            description: "Failed to load tags after multiple attempts. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [toast, retryCount]);

  // Manually retry loading
  const retryLoad = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Tag operations
  const handleAddTag = useCallback(async (data: { name: string; category?: string; active: boolean }) => {
    setIsSubmittingTag(true);
    
    try {
      await addTag({
        name: data.name,
        category: data.category || 'General', // Use a default category if undefined
        active: data.active
      });
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Tag added successfully" });
        setIsAddingTag(false);
        
        // Reload tags
        const updatedTags = await fetchTags();
        setTags(updatedTags);
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add tag",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingTag(false);
      }
    }
  }, [toast]);

  const handleUpdateTag = useCallback(async (data: { name?: string; category?: string; active?: boolean }) => {
    if (!selectedTag) return;
    
    setIsSubmittingTag(true);
    
    try {
      await updateTag(selectedTag._id, data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Tag updated successfully" });
        setIsEditingTag(false);
        setSelectedTag(null);
        
        // Reload tags
        const updatedTags = await fetchTags();
        setTags(updatedTags);
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update tag",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingTag(false);
      }
    }
  }, [selectedTag, toast]);

  const handleDeleteTag = useCallback(async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }
    
    try {
      await deleteTag(tagId);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Tag deleted successfully" });
        
        // Reload tags
        const updatedTags = await fetchTags();
        setTags(updatedTags);
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete tag",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleEditTag = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    setIsEditingTag(true);
  }, []);

  // Dialog controls
  const dialogControls = {
    add: {
      isOpen: isAddingTag,
      setOpen: setIsAddingTag,
      isSubmitting: isSubmittingTag
    },
    edit: {
      isOpen: isEditingTag,
      setOpen: setIsEditingTag,
      isSubmitting: isSubmittingTag,
      selected: selectedTag
    }
  };

  return {
    // Data
    tags,
    tagRows,
    isLoading,
    loadError,
    
    // Operations
    loadData,
    retryLoad,
    handleAddTag,
    handleUpdateTag,
    handleDeleteTag,
    handleEditTag,
    
    // Dialog controls
    dialogControls
  };
} 