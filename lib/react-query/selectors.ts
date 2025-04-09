import { useMemo } from 'react';
import { QueryKey, UseQueryResult } from '@tanstack/react-query';

/**
 * Type-safe selector function for data objects
 * 
 * @template TData The type of the data object
 * @template TResult The type of the result after selecting
 */
export type Selector<TData, TResult> = (data: TData) => TResult;

/**
 * Create a selector function with proper typing
 * 
 * @param selector Function that selects a subset of data
 * @returns A type-safe selector function
 */
export function createSelector<TData, TResult>(selector: Selector<TData, TResult>) {
  return selector;
}

/**
 * Creates a memoized data selector function
 * 
 * @param selector The original selector function
 * @param queryResult The query result to select from
 * @returns The selected data, or undefined if data is not available
 */
export function useQueryData<TData, TResult, TError = unknown>(
  queryResult: UseQueryResult<TData, TError>,
  selector: Selector<TData, TResult>
): TResult | undefined {
  return useMemo(() => {
    if (!queryResult.data) return undefined;
    return selector(queryResult.data);
  }, [queryResult.data, selector]);
}

/**
 * Creates a keyby selector to transform an array into an object
 * keyed by a property value
 * 
 * @param keyFn Function to extract the key from each item
 * @returns Object with items keyed by the extracted key
 */
export function createKeyBySelector<TItem, K extends string | number | symbol>(
  keyFn: (item: TItem) => K
): Selector<TItem[], Record<K, TItem>> {
  return (items) => {
    return items.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = item;
      return acc;
    }, {} as Record<K, TItem>);
  };
}

/**
 * Creates a filter selector to filter an array based on a predicate
 * 
 * @param predicate Function that returns true for items to keep
 * @returns Filtered array
 */
export function createFilterSelector<TItem>(
  predicate: (item: TItem) => boolean
): Selector<TItem[], TItem[]> {
  return (items) => items.filter(predicate);
}

/**
 * Creates a sort selector to sort an array based on one or more fields
 * 
 * @param sortFn Comparison function for sorting
 * @returns Sorted array
 */
export function createSortSelector<TItem>(
  sortFn: (a: TItem, b: TItem) => number
): Selector<TItem[], TItem[]> {
  return (items) => [...items].sort(sortFn);
}

/**
 * Creates a map selector to transform each item in an array
 * 
 * @param mapFn Function to transform each item
 * @returns Array of transformed items
 */
export function createMapSelector<TItem, TResult>(
  mapFn: (item: TItem) => TResult
): Selector<TItem[], TResult[]> {
  return (items) => items.map(mapFn);
}

/**
 * Creates a property selector to extract a specific property from an object
 * 
 * @param property The property to extract
 * @returns The extracted property value
 */
export function createPropertySelector<T, K extends keyof T>(
  property: K
): Selector<T, T[K]> {
  return (data) => data[property];
}

/**
 * Composes multiple selectors into one
 * 
 * @param selectors Array of selectors to compose
 * @returns A new selector that applies all selectors in sequence
 */
export function composeSelectors<T, R, Final>(
  selectors: [Selector<T, R>, ...Selector<any, any>[], Selector<any, Final>]
): Selector<T, Final> {
  return (data: T) => {
    return selectors.reduce((result, selector) => selector(result), data as any) as Final;
  };
}

/**
 * Creates a relationship selector to look up related items in another collection
 * 
 * @param relationKey The key in the item that references the related collection
 * @param relatedItems The collection of related items
 * @param relatedKey The key in the related items to match with relationKey
 * @returns A new object with the related item included
 */
export function createRelationshipSelector<TItem, TRelated>(
  relationKey: keyof TItem,
  relatedItems: TRelated[],
  relatedKey: keyof TRelated
): Selector<TItem[], (TItem & { related?: TRelated })[]> {
  return (items) => {
    // Create a lookup map for the related items
    const relatedMap = new Map<any, TRelated>();
    relatedItems.forEach(item => {
      const key = item[relatedKey];
      relatedMap.set(key, item);
    });
    
    // Add the related items to each item
    return items.map(item => {
      const relationValue = item[relationKey];
      const related = relatedMap.get(relationValue);
      return { ...item, related };
    });
  };
}

/**
 * Create a query key factory with strong typing
 * 
 * @param baseKey The base key for this entity type
 * @returns A set of functions to generate consistent query keys
 */
export function createTypedQueryKeys<
  TEntity extends string,
  TId extends string | number = string,
  TFilters extends Record<string, any> = Record<string, any>
>(baseKey: TEntity) {
  return {
    all: [baseKey] as const,
    lists: () => [...createTypedQueryKeys(baseKey).all, 'list'] as const,
    list: (filters?: TFilters) => 
      [...createTypedQueryKeys(baseKey).lists(), filters] as const,
    details: () => 
      [...createTypedQueryKeys(baseKey).all, 'detail'] as const,
    detail: (id: TId) => 
      [...createTypedQueryKeys(baseKey).details(), id] as const,
    active: () => 
      [...createTypedQueryKeys(baseKey).all, 'active'] as const,
    inactive: () => 
      [...createTypedQueryKeys(baseKey).all, 'inactive'] as const,
    search: (term: string) => 
      [...createTypedQueryKeys(baseKey).all, 'search', term] as const,
    infinite: () => 
      [...createTypedQueryKeys(baseKey).all, 'infinite'] as const,
    infiniteList: (filters?: TFilters) => 
      [...createTypedQueryKeys(baseKey).infinite(), filters] as const,
  };
} 