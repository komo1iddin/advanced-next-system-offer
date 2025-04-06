"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

export interface TagOption {
  id?: string;
  name: string;
  category: string;
  active?: boolean;
}

interface TagSelectorProps {
  tags: TagOption[];
  selectedTags?: string[];
  onChange: (selectedTagIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxSelections?: number;
}

export function TagSelector({
  tags,
  selectedTags = [],
  onChange,
  placeholder = "Select tags...",
  className,
  disabled = false,
  multiple = true,
  maxSelections = undefined,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Group tags by categories for better organization
  const tagsByCategory = useMemo(() => {
    const grouped: Record<string, TagOption[]> = {};
    
    // Only show active tags
    const activeTags = tags.filter(tag => tag.active !== false);
    
    activeTags.forEach(tag => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = [];
      }
      grouped[tag.category].push(tag);
    });
    
    return grouped;
  }, [tags]);
  
  // Filter tags based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return Object.keys(tagsByCategory);
    
    const query = searchQuery.toLowerCase();
    const matchingCategories: string[] = [];
    
    Object.entries(tagsByCategory).forEach(([category, categoryTags]) => {
      // Check if category matches search
      if (category.toLowerCase().includes(query)) {
        matchingCategories.push(category);
        return;
      }
      
      // Check if any tag in this category matches search
      const hasMatchingTag = categoryTags.some(tag => 
        tag.name.toLowerCase().includes(query)
      );
      
      if (hasMatchingTag) {
        matchingCategories.push(category);
      }
    });
    
    return matchingCategories;
  }, [tagsByCategory, searchQuery]);
  
  // Get tag names from IDs for display
  const selectedTagNames = useMemo(() => {
    return selectedTags.map(tagId => {
      const matchingTag = tags.find(tag => tag.id === tagId || tag.name === tagId);
      return matchingTag?.name || tagId;
    });
  }, [selectedTags, tags]);
  
  // Handle selecting a tag
  const handleSelect = (tagId: string) => {
    if (multiple) {
      if (selectedTags.includes(tagId)) {
        // Remove tag if already selected
        onChange(selectedTags.filter(id => id !== tagId));
      } else {
        // Add tag if not at max selections
        if (maxSelections && selectedTags.length >= maxSelections) {
          return; // Don't add if at max selections
        }
        onChange([...selectedTags, tagId]);
      }
    } else {
      // Single selection mode
      onChange([tagId]);
      setOpen(false);
    }
  };
  
  // Remove a tag from selection
  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId));
  };
  
  // Close dropdown when selecting in single mode
  useEffect(() => {
    if (!multiple && selectedTags.length > 0) {
      setOpen(false);
    }
  }, [selectedTags, multiple]);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left font-normal",
              !selectedTags.length && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {selectedTags.length > 0 ? (
              multiple ? (
                <span className="mr-1">
                  {`${selectedTags.length} selected`}
                </span>
              ) : (
                <span className="mr-1">{selectedTagNames[0]}</span>
              )
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search tags..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandList>
              {filteredCategories.map((category) => (
                <CommandGroup key={category} heading={category}>
                  {tagsByCategory[category]
                    .filter(tag => 
                      !searchQuery || 
                      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((tag) => {
                      const tagId = tag.id || tag.name;
                      const isSelected = selectedTags.includes(tagId);
                      return (
                        <CommandItem
                          key={tagId}
                          value={tag.name}
                          onSelect={() => handleSelect(tagId)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {tag.name}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected tags badges */}
      {multiple && selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tagId) => {
            const matchingTag = tags.find(tag => tag.id === tagId || tag.name === tagId);
            const tagName = matchingTag?.name || tagId;
            return (
              <Badge key={tagId} variant="secondary" className="px-2 py-1">
                {tagName}
                <button
                  type="button"
                  onClick={() => removeTag(tagId)}
                  className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
} 