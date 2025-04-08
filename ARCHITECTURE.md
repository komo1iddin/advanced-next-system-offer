# Project Architecture Guidelines

## Directory Structure

The project follows a Next.js App Router structure with these key directories:

- `/app` - Main application directory with page routes
- `/components` - Shared components used across the entire application
- `/hooks` - Custom React hooks
- `/lib` - Utility functions, API clients, and common libraries

## Component Organization

### UI Components

- **Global UI Components** should be placed in `/components/ui`
- **App-specific UI Components** should be placed in `/app/components/ui`

❌ **DO NOT** create duplicate components in both locations. Prefer using the root-level `/components/ui` for most UI components.

### Component Naming

- Use PascalCase for component files: `Button.tsx`, `Navbar.tsx`
- Use descriptive names that clearly indicate component purpose

### Component Exports

- Export components from an `index.ts` file in each component directory
- Example:
  ```typescript
  // components/ui/index.ts
  export { Button } from './Button';
  export { Input } from './Input';
  ```

## Hooks Organization

- All custom hooks should be placed in the root-level `/hooks` directory
- Follow kebab-case for hook files: `use-debounce.ts`, `use-media-query.ts`
- Follow camelCase for hook names: `useDebounce`, `useMediaQuery`

❌ **DO NOT** create hooks in multiple locations (e.g., `/app/hooks`, `/app/admin/hooks`)

## Library and Utilities

- All utility functions, API clients, and libraries should be placed in the root-level `/lib` directory
- Common utilities like class name merging (`cn()`) should be in `/lib/utils.ts`

❌ **DO NOT** duplicate utilities in multiple locations like `/app/lib`

## Table Components

Tables follow a structured organization:

- `/app/components/tables/shared` - Shared table components
  - `BaseTanStackTable.tsx` - Base table component
  - `TablePagination.tsx` - Pagination component
  - `SortableHeader.tsx` - Sortable header component
  - Other shared table utilities

- Entity-specific tables are organized by domain:
  - `/app/components/tables/[entity-name]/columns.tsx`
  - Examples: `/app/components/tables/offers/columns.tsx`, `/app/components/tables/agents/columns.tsx`

## Import Paths

- Use absolute imports with aliases for better organization:
  - `@/components/ui/Button` instead of `../../../components/ui/Button`
  - `@/hooks/use-debounce` instead of `../../../hooks/use-debounce`
  - `@/lib/utils` instead of `../../../lib/utils`

## CSS and Styling

- Only use one global CSS file, preferably `/app/globals.css`
- Component-specific styles should use Tailwind utility classes or CSS modules
- Avoid inline styles and multiple global CSS files

## Code Style

- Use TypeScript for type safety
- Follow consistent indentation (2 spaces)
- Use functional components with hooks instead of class components
- Use named exports for components and functions
- Add JSDoc comments for complex functions and components
- Keep components focused and under 200 lines where possible; split larger components

## State Management

- Use React's built-in state management (useState, useReducer) for simple state
- Consider using context for shared state across components
- Place context providers in the appropriate level of the component tree
- Keep state as close as possible to where it's used

## Testing

- Write tests for critical components and utility functions
- Place test files next to the implementation files with `.test.ts` or `.test.tsx` extension
- Group tests logically by feature or component
- Use Jest and React Testing Library for component testing
- Mock external dependencies and API calls in tests

## API and Data Fetching

- Use consistent patterns for data fetching (React Query, SWR, or custom hooks)
- Place API-related code in `/lib/api` directory
- Use TypeScript interfaces to define API response types
- Handle loading, error, and success states appropriately

## Best Practices

1. **Check Existing Components**: Before creating a new component, check if a similar one already exists.
2. **Avoid Duplication**: Never duplicate code, components, or utilities in multiple locations.
3. **Consistent Naming**: Follow established naming conventions for files and exports.
4. **Keep Related Code Together**: Group related components and utilities in the same directory.
5. **Import from Proper Locations**: Always import from the correct path to avoid confusion.
6. **Code Splitting**: Split large components into smaller, focused components.
7. **Type Safety**: Use proper TypeScript types for all props, state, and functions.

## Common Issues to Avoid

1. ❌ Creating duplicate components in both `/components` and `/app/components`
2. ❌ Placing hooks in multiple locations
3. ❌ Having multiple utility libraries (`lib` folders) in different locations
4. ❌ Inconsistent naming conventions
5. ❌ Multiple global CSS files
6. ❌ Overly large and complex components
7. ❌ Missing or inconsistent typing

## How to Refactor Existing Code

When encountering disorganized code:

1. Identify duplications and consolidate into a single location
2. Move hooks to the `/hooks` directory
3. Move utilities to the `/lib` directory
4. Update import paths in all affected files
5. Remove empty or redundant directories
6. Ensure proper TypeScript typing is applied
7. Split overly large components into smaller ones

## Code Review Checklist

Before submitting pull requests, ensure:

1. ✅ No duplicate components or utilities
2. ✅ Proper directory structure followed
3. ✅ Consistent naming conventions used
4. ✅ TypeScript types properly defined
5. ✅ Components are reasonably sized and focused
6. ✅ Imports use the correct paths
7. ✅ Tests are added for critical functionality