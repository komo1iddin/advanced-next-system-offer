# Admin Tables Component System

This directory contains a standardized system for creating consistent admin tables throughout the application using TanStack Table.

## Overview

The system consists of:

1. A base `BaseTanStackTable` component that provides core TanStack Table functionality
2. Entity-specific table components (e.g., `TanStackUniversitiesTable`, `TanStackAgentsTable`)
3. Shared components for common UI elements and states

## Components

### BaseTanStackTable

The foundation component that all entity-specific tables extend. It provides:

- Row selection functionality
- Sorting, filtering, and pagination
- State persistence across sessions
- Standardized loading, error, and empty states
- Consistent styling

**Usage:**

```tsx
<BaseTanStackTable
  data={dataArray}
  columns={columnsDefinition}
  isLoading={isLoading}
  isError={isError}
  error={error}
  refetch={refetchFunction}
  onSelectionChange={handleSelectionChange}
  stateKey="entity-name"
  itemsName="entities"
  emptyStateProps={{
    icon: EntityIcon,
    title: "No entities found",
    description: "Add your first entity to get started"
  }}
/>
```

### Entity-Specific Tables

The following specialized table components are available:

- `TanStackUniversitiesTable` - For university management
- `TanStackLocationsTable` - For location management (provinces/cities)
- `TanStackAgentsTable` - For agent management
- `TanStackUniversityDirectsTable` - For university direct contacts
- `TanStackTagsTable` - For tag management
- `TanStackOffersTable` - For study offers management

Each entity-specific table handles its own column definitions and cell rendering logic, but uses the same base component for consistent behavior.

### Shared Components

- `TableStates.tsx` - Components for loading, error, and empty states
- `TablePagination.tsx` - Pagination controls for tables
- `TableBadges.tsx` - Status and type badge components
- `SortableHeader.tsx` - Header component with sorting functionality

## How to Create a New Table Component

To create a table for a new entity type:

1. Create entity-specific column definitions in a `[entity]/columns.tsx` file
2. Create a new `TanStack[EntityName]Table.tsx` component that uses `BaseTanStackTable`
3. Import and use your new component in the appropriate admin page

Example:

```tsx
// Example entity-specific table
import { BaseTanStackTable } from './shared/BaseTanStackTable';
import { getEntityColumns } from './entity/columns';

export function TanStackEntityTable({
  data,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onSelectionChange,
  ...props
}) {
  const columns = getEntityColumns({
    onEdit,
    onDelete,
  });
  
  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onSelectionChange={onSelectionChange}
      stateKey="entity-name"
      itemsName="entities"
      {...props}
    />
  );
}
```

## Best Practices

1. **Consistent Props**: All table components should accept `isLoading`, `isError`, `error`, and `refetch` props
2. **Standard Actions**: Use the provided action button components for edit/delete operations
3. **Consistent Styling**: Use the provided badge components for status and type indicators
4. **Error Handling**: Let the base AdminTable handle error and loading states
5. **Empty States**: Provide a meaningful empty state with an icon and text 