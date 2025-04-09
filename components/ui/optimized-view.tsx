'use client';

import React, { memo, useMemo, ElementType } from 'react';

interface OptimizedViewProps<T, C extends ElementType = 'div'> {
  /**
   * The data to render
   */
  data: T[];
  
  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /**
   * Function to get a unique key for each item
   * @default item._id or index if not available
   */
  keyExtractor?: (item: T, index: number) => string;
  
  /**
   * Empty state component to render when there's no data
   */
  emptyComponent?: React.ReactNode;
  
  /**
   * Loading state component
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Whether the data is currently loading
   */
  isLoading?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Container element to use
   * @default 'div'
   */
  as?: C;
  
  /**
   * Optional additional props to pass to the container element
   */
  containerProps?: React.ComponentPropsWithoutRef<C>;
}

interface MemoizedItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

/**
 * A memoized item component that only re-renders when its props change
 */
function MemoizedItemComponent<T>({
  item,
  index,
  renderItem,
}: MemoizedItemProps<T>) {
  return <>{renderItem(item, index)}</>;
}

const MemoizedItem = memo(MemoizedItemComponent) as <T>(props: MemoizedItemProps<T>) => JSX.Element;

/**
 * OptimizedView - A performance-optimized component for rendering lists
 * 
 * This component uses React.memo and other optimization techniques to minimize
 * re-renders when data changes. It's especially useful for large lists or when
 * rendering complex items.
 */
export function OptimizedView<T extends Record<string, any>, C extends ElementType = 'div'>({
  data,
  renderItem,
  keyExtractor,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  className = '',
  as,
  containerProps = {},
}: OptimizedViewProps<T, C>) {
  // Default key extractor that tries to use _id or index
  const defaultKeyExtractor = (item: T, index: number) => {
    return item._id || item.id || `item-${index}`;
  };
  
  // Use the provided key extractor or the default one
  const getItemKey = keyExtractor || defaultKeyExtractor;
  
  // Determine the component to render
  const Component = as || 'div';
  
  // Memoize the list rendering to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (isLoading && loadingComponent) {
      return loadingComponent;
    }
    
    if (!data || data.length === 0) {
      return emptyComponent || <div className="text-gray-500 p-4 text-center">No items found</div>;
    }
    
    return data.map((item, index) => (
      <MemoizedItem<T>
        key={getItemKey(item, index)}
        item={item}
        index={index}
        renderItem={renderItem}
      />
    ));
  }, [data, isLoading, renderItem, getItemKey, emptyComponent, loadingComponent]);
  
  // Render the component with the provided properties
  return (
    <Component 
      className={className} 
      {...containerProps}
    >
      {content}
    </Component>
  );
}

/**
 * Create a memoized component that only re-renders when its props change
 * 
 * @param Component The component to memoize
 * @param propsAreEqual Optional custom comparison function
 * @returns A memoized version of the component
 */
export function createMemoizedComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * A hook to help with memoization of expensive calculations
 * 
 * @param factory Function that produces a value
 * @param dependencies Array of dependencies that the calculation depends on
 * @returns The memoized value
 */
export function useMemoValue<T>(factory: () => T, dependencies: React.DependencyList): T {
  return useMemo(factory, dependencies);
} 