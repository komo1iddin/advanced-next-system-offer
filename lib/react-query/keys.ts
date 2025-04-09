import { QueryFilters } from './types';

/**
 * Creates a query key factory for a specific entity type
 * 
 * @param scope - The base entity name/scope for the query keys
 * @returns An object with methods to generate standardized query keys
 */
export const createQueryKeys = <
  TEntity extends string,
  TId extends string | number = string
>(scope: TEntity) => {
  return {
    /**
     * Root key for all queries related to this entity
     */
    all: [scope] as const,
    
    /**
     * Key for listing entities, optionally with filters
     */
    lists: () => 
      [...createQueryKeys(scope).all, 'list'] as const,
    
    /**
     * Key for a filtered list of entities
     */
    list: (filters?: QueryFilters) => 
      [...createQueryKeys(scope).lists(), filters] as const,
    
    /**
     * Keys for entity details
     */
    details: () => 
      [...createQueryKeys(scope).all, 'detail'] as const,
    
    /**
     * Key for a specific entity by ID
     */
    detail: (id: TId) => 
      [...createQueryKeys(scope).details(), id] as const,
    
    /**
     * Keys for entity statistics
     */
    stats: () => 
      [...createQueryKeys(scope).all, 'stats'] as const,
    
    /**
     * Keys for entity infinite lists (pagination)
     */
    infinite: () => 
      [...createQueryKeys(scope).all, 'infinite'] as const,
    
    /**
     * Key for specific infinite list with filters
     */
    infiniteList: (filters?: QueryFilters) => 
      [...createQueryKeys(scope).infinite(), filters] as const,
  };
};

// Common query keys for the application
export const queryKeys = {
  agents: createQueryKeys('agents'),
  tags: createQueryKeys('tags'),
  universities: createQueryKeys('universities'),
  locations: createQueryKeys('locations'),
  settings: createQueryKeys('settings'),
  offers: createQueryKeys('offers'),
  universityDirects: createQueryKeys('universityDirects'),
  users: createQueryKeys('users'),
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },
  /**
   * Admin dashboard keys
   */
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentActivity: () => [...queryKeys.dashboard.all, 'recentActivity'] as const,
  },
  /**
   * System-level queries
   */
  system: {
    all: ['system'] as const, 
    health: () => [...queryKeys.system.all, 'health'] as const,
    configuration: () => [...queryKeys.system.all, 'configuration'] as const,
  },
}; 