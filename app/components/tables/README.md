# Admin Tables Component System

This directory contains a standardized system for creating consistent admin tables throughout the application. 

## Overview

The system consists of:

1. A base `AdminTable` component that handles common functionality
2. Entity-specific table components (e.g., `UniversitiesTable`, `AgentsTable`)
3. Utility components for common UI elements like badges and action buttons

## Components

### AdminTable

The base component that all entity-specific tables extend. It provides:

- Standardized loading states
- Consistent error handling
- Empty state display
- Automatic pagination (if needed)
- Consistent styling

**Usage:**

```tsx
<AdminTable
  columns={columnsDefinition}
  data={dataArray}
  keyField="id"
  isLoading={isLoading}
  error={errorState}
  onRetry={refetchFunction}
  emptyState={<CustomEmptyState />}
/>
```

### Entity-Specific Tables

The following specialized table components are available:

- `UniversitiesTable` - For university management
- `LocationsTable` - For location management (provinces/cities)
- `AgentsTable` - For agent management
- `UniversityDirectsTable` - For university direct contacts
- `TagsTable` - For tag management

Each entity-specific table handles its own column definitions and cell rendering logic, but uses the same base component for consistent behavior.

### Utility Components

- `StatusBadge` - For displaying active/inactive status
- `TypeBadge` - For displaying entity types
- `ActionButtons` - For standardized action buttons

## How to Create a New Table Component

To create a table for a new entity type:

1. Create a new file `EntityNameTable.tsx` in this directory
2. Import the base AdminTable: `import { AdminTable } from './AdminTable'`
3. Define the columns and types
4. Use the AdminTable component to render the data

Example:

```tsx
import { AdminTable } from './AdminTable';

interface MyEntityTableProps {
  entities: MyEntity[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  refetch?: () => void;
}

export function MyEntityTable(props: MyEntityTableProps) {
  const columns = [
    // Define columns
  ];

  return (
    <AdminTable
      columns={columns}
      data={props.entities}
      keyField="id"
      isLoading={props.isLoading}
      error={props.isError ? String(props.error) : null}
      onRetry={props.refetch}
      emptyState={<YourEmptyState />}
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