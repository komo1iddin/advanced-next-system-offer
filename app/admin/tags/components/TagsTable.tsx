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
  // Error states are now handled in parent component
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

  return (
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
        {tags.map((tag) => (
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
  );
} 