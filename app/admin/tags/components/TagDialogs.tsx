"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "../lib/tag-service";
import TagForm from "./TagForm";
import { FormModal } from "@/app/components/forms";

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
  onAddTag: (data: { name: string; category?: string; active: boolean; createMissingCategory?: boolean }) => void;
  onUpdateTag: (data: { name?: string; category?: string; active?: boolean }) => void;
}

export default function TagDialogs({ 
  tags, 
  dialogs, 
  onAddTag, 
  onUpdateTag 
}: TagDialogsProps) {
  const EmptyTrigger = () => <span style={{ display: 'none' }}></span>;

  return (
    <>
      {/* Add Tag Dialog */}
      <FormModal
        mode="create"
        entityLabels={{ singular: "Tag" }}
        open={dialogs.add.isOpen}
        onOpenChange={dialogs.add.setOpen}
        isSubmitting={dialogs.add.isSubmitting}
        onSubmit={onAddTag}
        schema={TagForm.schema}
        defaultValues={TagForm.getDefaultValues()}
        renderForm={(form) => <TagForm.Content form={form} tags={tags} mode="create" />}
      >
        <EmptyTrigger />
      </FormModal>

      {/* Edit Tag Dialog */}
      {dialogs.edit.selected && (
        <FormModal
          mode="edit"
          entityLabels={{ singular: "Tag" }}
          open={dialogs.edit.isOpen}
          onOpenChange={dialogs.edit.setOpen}
          isSubmitting={dialogs.edit.isSubmitting}
          onSubmit={onUpdateTag}
          schema={TagForm.schema}
          defaultValues={TagForm.getDefaultValues(dialogs.edit.selected)}
          renderForm={(form) => <TagForm.Content form={form} tags={tags} mode="edit" />}
        >
          <EmptyTrigger />
        </FormModal>
      )}
    </>
  );
} 