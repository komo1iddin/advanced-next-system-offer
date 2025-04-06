# Tags Admin Module

This module provides functionality for managing tags in the application.

## Components

### 1. TagModal

The new `TagModal` component provides a standardized way to create and edit tags using the `TagFormTemplate`.

#### Example Usage:

```tsx
// For creating a new tag
<TagModal mode="add" onSubmit={handleAddTag}>
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    Add Tag
  </Button>
</TagModal>

// For editing an existing tag
<TagModal 
  mode="edit" 
  tag={selectedTag} 
  onSubmit={handleUpdateTag}
  isSubmitting={isUpdatingTag}
>
  <Button variant="outline" size="sm">
    <Pencil className="w-4 h-4" />
  </Button>
</TagModal>
```

### 2. Migrating from the Current Implementation

To migrate from the current implementation to use the new `TagModal`:

1. Remove the current `TagDialogs` component
2. Replace it with direct usage of `TagModal` in your page

Example migration:

```tsx
// Before:
<AdminPageLayout>
  <TagsTable />
</AdminPageLayout>

<TagDialogs 
  tags={tags}
  dialogs={dialogControls}
  onAddTag={handleAddTag}
  onUpdateTag={handleUpdateTag}
/>

// After:
<AdminPageLayout
  title="Tags"
  description="Create and manage tags for categorizing content"
  actionButton={
    <TagModal mode="add" onSubmit={handleAddTag}>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Tag
      </Button>
    </TagModal>
  }
>
  <TagsTable
    tags={filteredTags}
    isLoading={isLoading}
    isError={isError}
    error={error}
    onEdit={(tag) => {
      setSelectedTag(tag);
      setIsEditModalOpen(true);
    }}
    onDelete={setTagToDelete}
    refetch={refetch}
  />
</AdminPageLayout>

{selectedTag && (
  <TagModal
    mode="edit"
    tag={selectedTag}
    onSubmit={handleUpdateTag}
    isSubmitting={isUpdatingTag}
    open={isEditModalOpen}
    onOpenChange={(open) => {
      setIsEditModalOpen(open);
      if (!open) setSelectedTag(null);
    }}
  />
)}
```

## Benefits of the New Approach

1. **Consistency**: Uses the same pattern as other entity forms
2. **Reusability**: The TagFormTemplate can be used in multiple contexts
3. **Maintainability**: Centralizes form logic in one place
4. **Type Safety**: Provides strong typing for form values 