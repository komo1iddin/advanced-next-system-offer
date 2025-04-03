"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { X, Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "./ui/spinner";
import { fetchTags, addTag } from "../admin/tags/lib/tag-service";

// Define the TagOption interface locally
export interface TagOption {
  id?: string;
  name: string;
  category: string;
  active?: boolean;
}

interface TagInputSelectorProps {
  items: string[]; 
  setItems: (items: string[]) => void;
  placeholder: string;
  badgeVariant?: "default" | "secondary" | "outline";
  maxTags?: number;
  allowCustomTags?: boolean;
}

export function TagInputSelector({
  items,
  setItems,
  placeholder,
  badgeVariant = "outline",
  maxTags,
  allowCustomTags = true
}: TagInputSelectorProps) {
  // For direct input and search
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  
  // For tag state management
  const [tagsLoading, setTagsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get unique categories
  const categories = [...new Set(availableTags.map(tag => tag.category))];
  
  // Group tags by categories for better organization
  const tagsByCategory = (() => {
    const grouped: Record<string, TagOption[]> = {};
    
    // Only show active tags that match filter
    filteredTags.forEach(tag => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = [];
      }
      grouped[tag.category].push(tag);
    });
    
    return grouped;
  })();
  
  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);
  
  // Update filtered tags when input or available tags change
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredTags(availableTags);
      return;
    }
    
    const query = inputValue.toLowerCase().trim();
    const filtered = availableTags.filter(tag => 
      tag.name.toLowerCase().includes(query) || 
      tag.category.toLowerCase().includes(query)
    );
    
    setFilteredTags(filtered);
  }, [inputValue, availableTags]);
  
  // Function to load tags
  const loadTags = async () => {
    setTagsLoading(true);
    setErrorMessage(null);
    
    try {
      const tags = await fetchTags(true); // Only get active tags
      setAvailableTags(tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        category: tag.category,
        active: tag.active
      })));
      setFilteredTags(tags.map(tag => ({
        id: tag._id,
        name: tag.name,
        category: tag.category,
        active: tag.active
      })));
    } catch (error) {
      console.error("Error loading tags:", error);
      setErrorMessage("Failed to load tags. Please try again.");
    } finally {
      setTagsLoading(false);
    }
  };
  
  // Checks if tag exists (case insensitive)
  const tagExists = (tagName: string): TagOption | undefined => {
    return availableTags.find(
      tag => tag.name.toLowerCase() === tagName.toLowerCase()
    );
  };
  
  // Create a new tag
  const createTag = async (tagName: string, category: string = "General") => {
    if (!tagName.trim()) return null;
    
    setCreatingTag(true);
    
    try {
      const tag = await addTag({
        name: tagName.trim(),
        category: category.trim() || "General",
        active: true
      });
      
      // Add the newly created tag to the available tags
      const newTag = {
        id: tag._id,
        name: tag.name,
        category: tag.category,
        active: true
      };
      
      setAvailableTags(prev => [...prev, newTag]);
      
      return newTag;
    } catch (error) {
      console.error("Error creating tag:", error);
      return null;
    } finally {
      setCreatingTag(false);
    }
  };
  
  // Add tag to selection
  const addTagToSelection = (tagId: string) => {
    if (maxTags && items.length >= maxTags) {
      return;
    }
    
    if (!items.includes(tagId)) {
      setItems([...items, tagId]);
    }
  };
  
  // Handle adding tag from input
  const handleAddTag = async () => {
    const value = inputValue.trim();
    if (!value) return;
    
    // Check if tag already exists
    const existingTag = tagExists(value);
    
    if (existingTag) {
      // Add existing tag
      addTagToSelection(existingTag.id || existingTag.name);
    } else if (allowCustomTags) {
      // Create and add new tag
      const newTag = await createTag(value);
      if (newTag) {
        addTagToSelection(newTag.id || newTag.name);
      }
    }
    
    // Clear input
    setInputValue("");
  };
  
  // Handle selecting a tag from dropdown
  const handleSelectTag = (tag: TagOption) => {
    addTagToSelection(tag.id || tag.name);
    setInputValue("");
    inputRef.current?.focus();
  };
  
  // Handle key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && !inputValue && items.length > 0) {
      // Remove last tag when pressing backspace with empty input
      setItems(items.slice(0, -1));
    }
  };
  
  // Remove tag from selection
  const removeTag = (tagId: string) => {
    setItems(items.filter(item => item !== tagId));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <div className="flex flex-wrap gap-1 p-1 border rounded-md items-center min-h-10">
            {/* Selected tags */}
            {items.map((tagId) => {
              const tag = availableTags.find(t => t.id === tagId || t.name === tagId);
              const displayName = tag ? tag.name : tagId;
              
              return (
                <Badge key={tagId} variant={badgeVariant} className="flex items-center gap-1 px-2 py-1">
                  {displayName}
                  <button
                    type="button"
                    onClick={() => removeTag(tagId)}
                    className="ml-1 rounded-full hover:bg-muted w-4 h-4 inline-flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            
            <div className="grow flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={items.length === 0 ? placeholder : ""}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 pl-1 h-8"
                disabled={maxTags ? items.length >= maxTags : false}
              />
            </div>
          </div>
          
          {/* Dropdown for tags */}
          {inputValue.trim().length > 0 && (
            <div className="absolute w-full z-10 bg-background border rounded-md mt-1 shadow-md">
              {tagsLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Spinner className="h-5 w-5 mr-2" />
                  <span>Loading tags...</span>
                </div>
              ) : (
                <Command className="rounded-lg border shadow-md">
                  <CommandList>
                    {Object.keys(tagsByCategory).length > 0 ? (
                      <>
                        {Object.entries(tagsByCategory).map(([category, tags]) => (
                          <CommandGroup key={category} heading={category}>
                            {tags.map((tag) => {
                              const tagId = tag.id || tag.name;
                              const isSelected = items.includes(tagId);
                              
                              return (
                                <CommandItem
                                  key={tagId}
                                  value={tag.name}
                                  onSelect={() => handleSelectTag(tag)}
                                  className="flex items-center"
                                >
                                  <div className="flex items-center flex-1">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span>{tag.name}</span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        ))}
                        
                        {/* Option to create a new tag if not found */}
                        {allowCustomTags && tagExists(inputValue.trim()) === undefined && (
                          <CommandItem 
                            onSelect={handleAddTag}
                            className="border-t"
                          >
                            <div className="flex items-center text-primary">
                              <span>Create tag "{inputValue.trim()}"</span>
                            </div>
                          </CommandItem>
                        )}
                      </>
                    ) : (
                      <CommandEmpty className="py-3 text-center">
                        {allowCustomTags ? (
                          <div>
                            <p>No matching tags found</p>
                            <p className="text-sm text-muted-foreground">Press Enter to create "{inputValue.trim()}"</p>
                          </div>
                        ) : (
                          <p>No matching tags found</p>
                        )}
                      </CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Type to search tags. Press Enter or comma to add a new tag.
        </div>
        
        {errorMessage && (
          <div className="text-destructive text-sm">{errorMessage}</div>
        )}
      </div>
    </div>
  );
} 