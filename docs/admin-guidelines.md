# Admin Pages Standardization Guidelines

This document outlines the standards for creating and maintaining consistent admin pages throughout the application. Following these guidelines will ensure a cohesive user experience across the admin interface.

## Table of Contents
1. [Using AdminPageLayout](#using-adminpagelayout)
2. [Breadcrumbs](#breadcrumbs)
3. [Page Headers](#page-headers)
4. [Action Buttons](#action-buttons)
5. [Search Implementation](#search-implementation)
6. [Bulk Actions](#bulk-actions)
7. [Modal Implementation](#modal-implementation)
8. [Consistent Spacing and Styling](#consistent-spacing-and-styling)

## Using AdminPageLayout

All admin pages must use the `AdminPageLayout` component to ensure consistency.

```tsx
<AdminPageLayout
  title="Page Title"
  description="Page description text"
  actionButton={actionButton}
  searchTerm={searchQuery}
  onSearchChange={setSearchQuery}
  itemCount={items.length}
  itemName="item"
  bulkActions={bulkActionsUI}
  breadcrumbs={breadcrumbs}
>
  {/* Page content here */}
  <YourTableComponent />
</AdminPageLayout>
```

The `AdminPageLayout` is responsible for maintaining consistent page structure, spacing, and styling across all admin pages.

## Breadcrumbs

Implement breadcrumbs on all admin pages following this pattern:

```tsx
const breadcrumbs = [
  { title: "Entity Name", href: "/admin/entity-name" }
];
```

- Always use the page name as the title in the breadcrumb
- Use consistent URL patterns
- The Dashboard will automatically be included as the first breadcrumb

## Page Headers

Page headers should include:

1. A clear, concise title
2. A brief description of the page's purpose
3. Primary action button(s) if applicable

Example:
```tsx
title="Universities"
description="Manage university listings and their rankings"
```

## Action Buttons

Action buttons should follow these conventions:

```tsx
const actionButton = (
  <Button variant="default" className="w-full sm:w-auto">
    <PlusCircle className="mr-2 h-4 w-4" />
    Add Entity
  </Button>
);
```

For multiple action buttons:

```tsx
const actionButton = (
  <div className="flex flex-col sm:flex-row gap-2">
    <Button variant="default" className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add First Entity
    </Button>
    <Button variant="default" className="w-full sm:w-auto">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Second Entity
    </Button>
  </div>
);
```

- Use `PlusCircle` icon for add actions
- Add appropriate margin to icons (mr-2)
- Make buttons responsive with `w-full sm:w-auto`

## Search Implementation

Search functionality should be implemented through the `AdminPageLayout` props:

```tsx
searchTerm={searchQuery}
onSearchChange={setSearchQuery}
```

- The search input component is automatically rendered
- Search should filter the displayed data based on common text fields
- Implement filtering logic in a separate function or middleware

## Bulk Actions

Bulk actions should be displayed when one or more rows are selected, following this structure:

```tsx
const bulkActionsUI = selectedRows.length > 0 ? (
  <div className="flex items-center justify-between w-full">
    <p className="text-sm font-medium">
      {selectedRows.length} {selectedRows.length === 1 ? 'item' : 'items'} selected
    </p>
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleBulkStatusChange(true)}
      >
        Activate
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleBulkStatusChange(false)}
      >
        Deactivate
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setSelectedRows([])}
      >
        Clear Selection
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={handleBulkDelete}
      >
        Delete Selected
      </Button>
    </div>
  </div>
) : null;
```

- Always include a "Clear Selection" button
- Use `variant="destructive"` for delete actions
- When applicable, include Activate/Deactivate buttons
- Show the count of selected items

## Modal Implementation

For adding or editing entities, use the shared modal components pattern:

```tsx
// For simple modals with a button trigger
<EntityModal mode="add">
  <Button variant="default" className="w-full sm:w-auto">
    <PlusCircle className="mr-2 h-4 w-4" />
    Add Entity
  </Button>
</EntityModal>

// For manually controlled modals
const dialogControl = {
  isOpen: isDialogOpen,
  setOpen: setIsDialogOpen,
  isSubmitting: isSubmitting
};

// Then later in JSX
<EntityModal 
  mode="create" 
  dialogControl={dialogControl}
  onSubmit={handleSubmit}
  triggerless={true}
/>
```

- Use the `triggerless` prop to render modals without a trigger button
- Standardize on descriptive mode values: "create", "edit", "view"
- Handle modal state and submissions consistently

## Consistent Spacing and Styling

Page layout should use the following spacing:

- Container padding: `p-6`
- Space between sections: `space-y-6`
- Items in flex containers: `gap-2`
- Card styling: `shadow-sm`

Tables should use TanStack table components with the following pattern:

```tsx
<TanStackEntityTable
  data={filteredEntities}
  isLoading={isLoading}
  isError={isError}
  error={error}
  onToggleActive={handleToggleActive}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onSelectionChange={setSelectedRows}
  globalFilter={searchQuery}
  onGlobalFilterChange={setSearchQuery}
  refetch={refetch}
/>
```

Following these guidelines will ensure that all admin pages have a consistent look and feel, making the application more professional and easier to navigate for users. 