"use client";

import { Button } from "@/components/ui/button";
import { Tag } from "../lib/tag-service";
import { TagRow, formatDate } from "../lib/utils";
import { Pencil, Trash2, Tag as TagIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface TagsTableProps {
  tags: TagRow[];
  isLoading: boolean;
  loadError?: string | null;
  retryLoad?: () => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
}

export default function TagsTable({
  tags,
  isLoading,
  loadError,
  retryLoad,
  onEditTag,
  onDeleteTag,
}: TagsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    tags.forEach(tag => uniqueCategories.add(tag.category));
    return Array.from(uniqueCategories).sort();
  }, [tags]);
  
  // Filter tags based on search term and category
  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = searchTerm === "" || 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.category.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = categoryFilter === null || tag.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [tags, searchTerm, categoryFilter]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading tags...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive/70" />
        <p className="mt-2 text-muted-foreground">Failed to load tags: {loadError}</p>
        <Button 
          onClick={retryLoad} 
          variant="outline" 
          className="mt-4"
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-8">
        <TagIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-muted-foreground">No tags found. Add your first tag to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={categoryFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategoryFilter(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tag.category}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={tag.active ? "default" : "destructive"}
                    className={
                      tag.active
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {tag.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(tag.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const originalTag: Tag = {
                          _id: tag.id,
                          name: tag.name,
                          category: tag.category,
                          active: tag.active,
                          createdAt: tag.createdAt.toString(),
                          updatedAt: new Date().toString(),
                        };
                        onEditTag(originalTag);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteTag(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 