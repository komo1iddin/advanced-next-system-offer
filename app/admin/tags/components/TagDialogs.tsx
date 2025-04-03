"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Tag } from "../lib/tag-service";
import TagForm from "./TagForm";

interface DialogControl<T> {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isSubmitting: boolean;
  selected?: T | null;
}

interface TagDialogsProps {
  tags: Tag[];
  dialogs: {
    add: DialogControl<never>;
    edit: DialogControl<Tag>;
  };
  onAddTag: (data: { name: string; category?: string; active: boolean }) => void;
  onUpdateTag: (data: { name?: string; category?: string; active?: boolean }) => void;
}

export default function TagDialogs({ 
  tags, 
  dialogs, 
  onAddTag, 
  onUpdateTag 
}: TagDialogsProps) {
  return (
    <>
      {/* Add Tag Dialog */}
      <Dialog open={dialogs.add.isOpen} onOpenChange={dialogs.add.setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag for categorizing study offers.
            </DialogDescription>
          </DialogHeader>
          <TagForm
            allTags={tags}
            onSubmit={onAddTag}
            isSubmitting={dialogs.add.isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={dialogs.edit.isOpen} onOpenChange={dialogs.edit.setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Modify the existing tag.
            </DialogDescription>
          </DialogHeader>
          {dialogs.edit.selected && (
            <TagForm
              tag={dialogs.edit.selected}
              allTags={tags}
              onSubmit={onUpdateTag}
              isSubmitting={dialogs.edit.isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 