# Admin UI Component System

This directory contains a standardized system for creating consistent admin pages throughout the application.

## Overview

The system consists of:

1. **Base Table Components**: A set of reusable table components found in `app/components/tables`
2. **Admin Layout Components**: Components for page headers, cards, and layouts in this directory
3. **Standard UI Elements**: Badges, buttons, and other UI elements for consistent styling

## Admin Page Layout Components

### AdminPageLayout

A comprehensive component that wraps common admin page patterns including headers, page titles, and search functionality.

**Usage:**

```tsx
import { AdminPageLayout } from "@/components/ui/admin/page-layout";

export default function MyEntityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError, error } = useMyEntityQuery();
  
  // Add button for the header
  const addButton = (
    <Button onClick={handleOpenAddModal}>
      <Plus className="mr-2 h-4 w-4" />
      Add New Entity
    </Button>
  );

  return (
    <AdminPageLayout
      title="My Entities"
      description="Manage entities in the system"
      actionButton={addButton}
      cardTitle="All Entities"
      searchTerm={searchQuery}
      onSearchChange={setSearchQuery}
      itemCount={data.length}
      itemName="entity"
    >
      <EntityTable
        entities={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </AdminPageLayout>
  );
}
```

### AdminPageHeader

Used for consistent page headers with a title and optional action button. Part of the admin/page-layout.tsx component.

**Props:**
- `title`: Main page title
- `description`: Optional page description
- `actionButton`: Optional React node for actions (typically an add button)

### AdminCard

Used for content cards with consistent styling. Part of the admin/page-layout.tsx component.

**Props:**
- `title`: Card title
- `description`: Optional card description
- `searchTerm`: Optional search term value
- `onSearchChange`: Optional function to handle search changes
- `itemCount`: Optional count of items being displayed
- `itemName`: Optional singular name of the item for pluralization
- `children`: Card content

## Table Components

See the documentation in `app/components/tables/README.md` for details on the table component system.

## Best Practices

1. **Use AdminPageLayout for All Admin Pages**: This ensures consistent styling and behavior
2. **Keep Entity-Specific Logic in Components**: The page should primarily handle state and data fetching
3. **Use Standardized Table Components**: Don't create custom table implementations
4. **Consistent Button Placement**: Add buttons should generally be in the page header
5. **Consistent Action Buttons**: Edit and delete buttons should be placed in the Actions column

## Example Implementation

For examples, see:
- `app/admin/universities/page.tsx`
- `app/admin/tags/page.tsx`

These pages demonstrate the proper usage of the AdminPageLayout component alongside the entity-specific table components.