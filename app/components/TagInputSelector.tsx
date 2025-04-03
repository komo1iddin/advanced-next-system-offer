"use client";

import { useState, useEffect } from "react";
import { X, Plus, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { fetchTags, addTag } from "@/app/admin/tags/lib/tag-service";

// Define the TagOption interface locally
export interface TagOption {
  id?: string;
  name: string;
  category: string;
  active?: boolean;
}

// Include the TagSelector component directly
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

function TagSelector({
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
  const tagsByCategory = (() => {
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
  })();
  
  // Filter tags based on search query
  const filteredCategories = (() => {
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
  })();
  
  // Get tag names from IDs for display
  const selectedTagNames = selectedTags.map(tagId => {
    const matchingTag = tags.find(tag => tag.id === tagId || tag.name === tagId);
    return matchingTag?.name || tagId;
  });
  
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
  // For direct input
  const [currentItem, setCurrentItem] = useState("");
  
  // For tag selector
  const [tagsLoading, setTagsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [inputMode, setInputMode] = useState<"select" | "input">("select");
  
  // Get unique categories
  const categories = [...new Set(availableTags.map(tag => tag.category))];
  
  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);
  
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
    } catch (error) {
      console.error("Error loading tags:", error);
      setErrorMessage("Failed to load tags. Please try again.");
    } finally {
      setTagsLoading(false);
    }
  };
  
  // Handle manual add
  const addItem = () => {
    if (maxTags && items.length >= maxTags) {
      return;
    }
    
    if (currentItem.trim() && !items.includes(currentItem.trim())) {
      setItems([...items, currentItem.trim()]);
      setCurrentItem("");
    }
  };
  
  // Remove item
  const removeItem = (itemToRemove: string) => {
    setItems(items.filter(item => item !== itemToRemove));
  };
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };
  
  // Handle tag selection change
  const handleTagSelectionChange = (selectedTagIds: string[]) => {
    setItems(selectedTagIds);
  };
  
  // Create a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      return;
    }
    
    setIsAddingTag(true);
    
    try {
      const tag = await addTag({
        name: newTagName.trim(),
        category: newTagCategory.trim() || "General",
        active: true
      });
      
      // Add the newly created tag to the available tags
      setAvailableTags([
        ...availableTags,
        {
          id: tag._id,
          name: tag.name,
          category: tag.category,
          active: true
        }
      ]);
      
      // Select the new tag
      setItems([...items, tag._id]);
      
      // Close the dialog
      setAddTagDialogOpen(false);
      setNewTagName("");
      setNewTagCategory("");
    } catch (error) {
      console.error("Error creating tag:", error);
    } finally {
      setIsAddingTag(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "select" | "input")}>
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="select">Select Tags</TabsTrigger>
            {allowCustomTags && <TabsTrigger value="input">Custom Input</TabsTrigger>}
          </TabsList>
          
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={loadTags}
              disabled={tagsLoading}
            >
              {tagsLoading ? <Spinner className="h-4 w-4 mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Refresh
            </Button>
            
            <Dialog open={addTagDialogOpen} onOpenChange={setAddTagDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tag Name</label>
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={newTagCategory}
                      onChange={(e) => setNewTagCategory(e.target.value)}
                      placeholder="Enter category or leave blank for General"
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map(category => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddTagDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={isAddingTag || !newTagName.trim()}
                    >
                      {isAddingTag ? <Spinner className="h-4 w-4 mr-1" /> : null}
                      Create Tag
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="select" className="space-y-4">
          {tagsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6" />
            </div>
          ) : errorMessage ? (
            <div className="text-destructive py-2">{errorMessage}</div>
          ) : (
            <TagSelector
              tags={availableTags}
              selectedTags={items}
              onChange={handleTagSelectionChange}
              placeholder={placeholder}
              maxSelections={maxTags}
            />
          )}
        </TabsContent>
        
        {allowCustomTags && (
          <TabsContent value="input" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={currentItem}
                onChange={(e) => setCurrentItem(e.target.value)}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
              />
              <Button 
                type="button" 
                onClick={addItem}
                disabled={maxTags ? items.length >= maxTags : false}
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No items added yet</p>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          // Try to find the tag name if it's an ID
          const tag = availableTags.find(t => t.id === item);
          const displayName = tag ? tag.name : item;
          
          return (
            <Badge key={item} variant={badgeVariant} className="flex items-center gap-1">
              {displayName}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-1 rounded-full hover:bg-muted w-4 h-4 inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
} 