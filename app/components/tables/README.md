# TanStack Table Implementation Guide

This guide outlines how to implement consistent tables across the admin interfaces using our standardized TanStack table components.

## Table Component Architecture

The table implementation follows a standardized structure:

1. **Shared Components** - Reusable components used by all tables
   - `BaseTanStackTable.tsx` - Base table implementation with common functionality
   - `TableSelectionCheckbox.tsx` - Standardized checkbox for row selection
   - `TableStatusToggle.tsx` - Display-only component for showing status badges
   - `TableActionButtons.tsx` - Standardized action buttons (activate/deactivate, edit, view, delete)
   - `FormatUtils.ts` - Utility functions for consistent formatting
   - `TablePagination.tsx` - Standardized pagination component
   - `TableStates.tsx` - Loading, error, and empty state components
   - `SortableHeader.tsx` - Header with sorting functionality

2. **Entity-Specific Components**
   - Entity-specific table component (e.g., `TanStackTagsTable.tsx`)
   - Entity-specific column definitions (e.g., `tags/columns.tsx`)

## Design Standards

1. **Action Buttons**
   - All tables must use inline button groups
   - Button order: Activate/Deactivate, Edit, View, Delete
   - Activate/Deactivate button has distinct styling:
     - Green background for inactive items (to activate)
     - Amber background for active items (to deactivate)
     - Animation effects when clicked
   - All delete actions must have alert dialog confirmations
   - Buttons are icon-only for compactness with title attributes for tooltips

2. **Status Display**
   - Status column shows a badge indicating current status (active/inactive)
   - No interactive elements in the status column - all actions through action buttons
   - Uses Shadcn UI Badge component for consistent styling

3. **Selection & Bulk Actions**
   - All tables must support row selection
   - All admin pages must implement bulk actions

4. **Column Headers and Alignment**
   - All columns must have headers with appropriate titles
   - The Actions column must always have "Actions" as its title
   - Use `SortableHeader` component with the `align` prop to control alignment
   - Data cells should have matching alignment with their headers
   - Recommended alignments:
     - Selection column: center
     - Text/Name columns: left
     - Status/Category columns: center
     - Date columns: center
     - Actions column: center
   - Wrap cell content in `<div className="text-center">` for centered content
   - **Important**: Action buttons container must use `justify-center` (not `justify-end`) to align with the header

5. **Styling Consistency**
   - Use Tailwind classes consistently
   - Use Shadcn UI components for consistent design
   - All alert dialog designs must be the same

6. **Icon Usage**
   - Use Lucide React icons consistently across all tables
   - Standard icons: 
     - Check (activate)
     - X (deactivate)
     - Edit (edit)
     - ExternalLink (view)
     - Trash2 (delete)

## Implementation Steps

### 1. Create Column Definitions

Define column definitions in a separate file (e.g., `app/components/tables/[entity]/columns.tsx`):

```tsx
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { SortableHeader } from "../shared/SortableHeader";
import { TableSelectionCheckbox } from "../shared/TableSelectionCheckbox";
import { TableStatusToggle } from "../shared/TableStatusToggle";
import { TableActionButtons } from "../shared/TableActionButtons";
import { formatDate, formatNullable } from "../shared/FormatUtils";

// Type definition must be consistent across all column generators
export interface EntityColumnsProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  onView?: (id: string) => void;
}

export function getEntityColumns({
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: EntityColumnsProps): ColumnDef<EntityType, any>[] {
  const columnHelper = createColumnHelper<EntityType>();

  return [
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        <div className="text-center">
          <TableSelectionCheckbox
            checked={table.getIsAllPageRowsSelected() || 
                   (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            label="Select all rows"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <TableSelectionCheckbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            label="Select row"
          />
        </div>
      ),
      enableSorting: false,
    },
    
    // Data columns
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Name" align="left" />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    
    // Status column (display only)
    columnHelper.accessor("active", {
      header: ({ column }) => <SortableHeader column={column} title="Status" align="center" />,
      cell: (info) => (
        <div className="text-center">
          <TableStatusToggle
            isActive={info.getValue()}
          />
        </div>
      ),
    }),
    
    // Actions column
    columnHelper.display({
      id: "actions",
      header: ({ column }) => <SortableHeader column={column} title="Actions" align="center" />,
      cell: (info) => {
        const entity = info.row.original;
        return (
          <TableActionButtons
            id={entity.id}
            name={entity.name}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            isActive={entity.active}
            onView={onView}
          />
        );
      },
    }),
  ];
}
```

### 2. Create Table Component

Create the table component (e.g., `app/components/tables/TanStackEntityTable.tsx`):

```tsx
"use client";

import { EntityIcon } from "lucide-react";
import { BaseTanStackTable } from "./shared/BaseTanStackTable";
import { getEntityColumns } from "./entity/columns";

// Standardized props interface
interface TanStackEntityTableProps {
  data: Entity[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onSelectionChange?: (selectedRows: Entity[]) => void;
  refetch?: () => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function TanStackEntityTable({
  data = [],
  isLoading = false,
  isError = false,
  error,
  onToggleActive,
  onEdit,
  onDelete,
  onView,
  onSelectionChange,
  refetch,
  globalFilter = "",
  onGlobalFilterChange,
}: TanStackEntityTableProps) {
  // Get column definitions
  const columns = getEntityColumns({
    onEdit,
    onDelete,
    onToggleActive,
    onView,
  });

  return (
    <BaseTanStackTable
      data={data}
      columns={columns}
      tableId="entity"
      itemsName="entities"
      emptyIcon={EntityIcon}
      emptyTitle="No entities found"
      emptyDescription="Add your first entity to get started."
      isLoading={isLoading}
      isError={isError}
      error={error}
      refetch={refetch}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      onSelectionChange={onSelectionChange}
    />
  );
}
```

### 3. Implement Bulk Actions in Admin Page

All admin pages must include bulk actions for consistent UX:

```tsx
import { TanStackEntityTable } from "@/app/components/tables/TanStackEntityTable";
import { Button } from "@/components/ui/button";

export default function EntityPage() {
  // State for selected rows
  const [selectedRows, setSelectedRows] = useState<Entity[]>([]);
  
  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    // Implement confirmation and deletion logic
  };
  
  const handleBulkToggleActive = (active: boolean) => {
    if (selectedRows.length === 0) return;
    // Implement status toggle logic
  };
  
  return (
    <AdminPageLayout
      title="Entities"
      description="Manage your entities"
      // Add bulk actions to admin page layout
      bulkActions={selectedRows.length > 0 ? (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleBulkToggleActive(true)}
            className="mr-2"
          >
            Activate
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleBulkToggleActive(false)}
            className="mr-2"
          >
            Deactivate
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
          <span className="ml-2 text-sm text-muted-foreground">
            {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
        </>
      ) : null}
    >
      <TanStackEntityTable
        data={entities}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onView={handleView}
        onSelectionChange={setSelectedRows}
        globalFilter={searchQuery}
        onGlobalFilterChange={setSearchQuery}
        refetch={refetch}
      />
    </AdminPageLayout>
  );
}
```

## Converting Existing Tables

When converting existing tables:

1. Update column definitions to use the standardized components
2. Ensure consistent type definitions across all column generators
3. Remove toggle functionality from status column - it should only display status
4. Make sure status toggling is handled by the action buttons with animation
5. Implement bulk actions in all admin pages
6. Add proper column titles to all columns, including the actions column
7. Implement consistent alignment for headers and cell content

## Accessibility

1. Always provide `label` prop for `TableSelectionCheckbox`
2. Provide `title` attributes on icon-only buttons
3. Ensure sufficient color contrast for status badges 