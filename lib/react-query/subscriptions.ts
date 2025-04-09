import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient, QueryKey, QueryClient } from '@tanstack/react-query';

// Default WebSocket endpoint
const DEFAULT_WS_ENDPOINT = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:3001';

/**
 * Types of subscription events
 */
export enum SubscriptionEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  PATCHED = 'patched',
}

/**
 * Subscription message format received from WebSocket
 */
export interface SubscriptionMessage<TData = any> {
  type: SubscriptionEventType;
  resource: string;
  id?: string;
  data?: TData;
  timestamp: number;
}

/**
 * Configuration for a subscription
 */
export interface SubscriptionConfig {
  resource: string;
  id?: string;
  queryKey: QueryKey;
  onMessage?: (message: SubscriptionMessage) => void;
  enabled?: boolean;
}

/**
 * WebSocket connection states
 */
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * Subscription manager to handle WebSocket connection and event handling
 */
export class SubscriptionManager {
  private ws: WebSocket | null = null;
  private queryClient: QueryClient;
  private endpoint: string;
  private subscriptions: Map<string, SubscriptionConfig[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 2000; // Start with 2 seconds
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionStateListeners: ((state: ConnectionState) => void)[] = [];

  constructor(queryClient: QueryClient, endpoint: string = DEFAULT_WS_ENDPOINT) {
    this.queryClient = queryClient;
    this.endpoint = endpoint;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return; // Already connecting or connected
    }

    this.updateConnectionState(ConnectionState.CONNECTING);

    try {
      this.ws = new WebSocket(this.endpoint);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateConnectionState(ConnectionState.CONNECTED);
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: SubscriptionMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.updateConnectionState(ConnectionState.DISCONNECTED);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        this.updateConnectionState(ConnectionState.ERROR);
        console.error('WebSocket error:', error);
        this.attemptReconnect();
      };
    } catch (error) {
      this.updateConnectionState(ConnectionState.ERROR);
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      // Exponential backoff with jitter
      const delay = Math.min(
        30000, // Maximum 30 seconds
        this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts) * (0.9 + Math.random() * 0.2)
      );

      this.reconnectAttempts += 1;
      this.reconnectTimeoutId = setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateConnectionState(ConnectionState.DISCONNECTED);
  }

  /**
   * Subscribe to a resource
   */
  subscribe(config: SubscriptionConfig): () => void {
    const { resource, id } = config;
    const key = id ? `${resource}:${id}` : resource;

    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }

    this.subscriptions.get(key)!.push(config);

    // If we're already connected, send the subscription
    if (this.isConnected()) {
      this.sendSubscription(config);
    } else if (this.connectionState !== ConnectionState.CONNECTING) {
      // If not connecting, try to connect
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(config);
    };
  }

  /**
   * Unsubscribe from a resource
   */
  unsubscribe(config: SubscriptionConfig): void {
    const { resource, id } = config;
    const key = id ? `${resource}:${id}` : resource;

    if (this.subscriptions.has(key)) {
      const subs = this.subscriptions.get(key)!;
      const index = subs.indexOf(config);
      
      if (index !== -1) {
        subs.splice(index, 1);
      }

      if (subs.length === 0) {
        this.subscriptions.delete(key);
        this.sendUnsubscription(config);
      }
    }
  }

  /**
   * Send subscription message to the server
   */
  private sendSubscription(config: SubscriptionConfig): void {
    if (!this.isConnected()) return;

    try {
      const message = {
        action: 'subscribe',
        resource: config.resource,
        id: config.id,
      };

      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send subscription:', error);
    }
  }

  /**
   * Send unsubscription message to the server
   */
  private sendUnsubscription(config: SubscriptionConfig): void {
    if (!this.isConnected()) return;

    try {
      const message = {
        action: 'unsubscribe',
        resource: config.resource,
        id: config.id,
      };

      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send unsubscription:', error);
    }
  }

  /**
   * Resubscribe all active subscriptions (after reconnect)
   */
  private resubscribeAll(): void {
    // Flatten all subscriptions into a single array
    const allSubscriptions: SubscriptionConfig[] = [];
    this.subscriptions.forEach(configs => {
      configs.forEach(config => {
        allSubscriptions.push(config);
      });
    });

    // Send each subscription
    allSubscriptions.forEach(config => {
      this.sendSubscription(config);
    });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming messages from WebSocket
   */
  private handleMessage(message: SubscriptionMessage): void {
    const { resource, id, type, data } = message;
    
    // Find keys to match (both general resource and specific id)
    const keys = id 
      ? [`${resource}:${id}`, resource]
      : [resource];
    
    // Notify all matching subscriptions
    keys.forEach(key => {
      const subscriptions = this.subscriptions.get(key);
      if (subscriptions) {
        subscriptions.forEach(subscription => {
          // Call the custom message handler if provided
          if (subscription.onMessage) {
            subscription.onMessage(message);
          }
          
          // Update the query cache based on the message type
          switch (type) {
            case SubscriptionEventType.CREATED:
              this.handleCreatedEvent(subscription.queryKey, data);
              break;
            case SubscriptionEventType.UPDATED:
            case SubscriptionEventType.PATCHED:
              this.handleUpdatedEvent(subscription.queryKey, data);
              break;
            case SubscriptionEventType.DELETED:
              this.handleDeletedEvent(subscription.queryKey, id || (data as any)?._id);
              break;
          }
        });
      }
    });
  }

  /**
   * Handle 'created' events by adding to list queries
   */
  private handleCreatedEvent(queryKey: QueryKey, data: any): void {
    // Add the new item to the beginning of all matching list queries
    this.queryClient.setQueriesData(
      { queryKey, exact: false },
      (oldData: any) => {
        if (!oldData) return oldData;
        
        // Handle array data (list queries)
        if (Array.isArray(oldData)) {
          return [data, ...oldData];
        }
        
        // Handle paginated data
        if (oldData.pages && Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              // Only add to the first page
              if (index === 0 && page.data && Array.isArray(page.data)) {
                return {
                  ...page,
                  data: [data, ...page.data],
                  // Update counts if they exist
                  ...(page.count ? { count: page.count + 1 } : {}),
                  ...(page.total ? { total: page.total + 1 } : {})
                };
              }
              return page;
            }),
          };
        }
        
        return oldData;
      }
    );
    
    // Also update or create the detail query for this item
    if (data._id) {
      const detailQueryKey = [...queryKey.slice(0, 1), data._id];
      this.queryClient.setQueryData(detailQueryKey, data);
    }
  }

  /**
   * Handle 'updated' events by updating the data in all matching queries
   */
  private handleUpdatedEvent(queryKey: QueryKey, data: any): void {
    if (!data || !data._id) return;
    
    // Update the data in all matching queries
    this.queryClient.setQueriesData(
      { queryKey, exact: false },
      (oldData: any) => {
        if (!oldData) return oldData;
        
        // Handle array data (list queries)
        if (Array.isArray(oldData)) {
          return oldData.map(item => 
            item._id === data._id ? { ...item, ...data } : item
          );
        }
        
        // Handle paginated data
        if (oldData.pages && Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              if (page.data && Array.isArray(page.data)) {
                return {
                  ...page,
                  data: page.data.map((item: any) => 
                    item._id === data._id ? { ...item, ...data } : item
                  )
                };
              }
              return page;
            }),
          };
        }
        
        // Handle single item data (detail query)
        if (oldData._id === data._id) {
          return { ...oldData, ...data };
        }
        
        return oldData;
      }
    );
    
    // Also update the detail query specifically
    const detailQueryKey = [...queryKey.slice(0, 1), data._id];
    this.queryClient.setQueryData(
      detailQueryKey,
      (oldData: any) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      }
    );
  }

  /**
   * Handle 'deleted' events by removing the item from all matching queries
   */
  private handleDeletedEvent(queryKey: QueryKey, id: string | undefined): void {
    if (!id) return;
    
    // Remove the item from all matching queries
    this.queryClient.setQueriesData(
      { queryKey, exact: false },
      (oldData: any) => {
        if (!oldData) return oldData;
        
        // Handle array data (list queries)
        if (Array.isArray(oldData)) {
          return oldData.filter(item => item._id !== id);
        }
        
        // Handle paginated data
        if (oldData.pages && Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              if (page.data && Array.isArray(page.data)) {
                const newData = page.data.filter((item: any) => item._id !== id);
                return {
                  ...page,
                  data: newData,
                  // Update counts if they exist
                  ...(page.count ? { count: newData.length } : {}),
                  ...(page.total && page.total > 0 ? { total: page.total - 1 } : {})
                };
              }
              return page;
            }),
          };
        }
        
        return oldData;
      }
    );
    
    // Remove the detail query for this item
    const detailQueryKey = [...queryKey.slice(0, 1), id];
    this.queryClient.removeQueries({ queryKey: detailQueryKey });
  }

  /**
   * Update connection state and notify listeners
   */
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    
    // Notify all listeners
    this.connectionStateListeners.forEach(listener => {
      listener(state);
    });
  }

  /**
   * Add a connection state listener
   */
  addConnectionStateListener(listener: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.push(listener);
    
    // Return function to remove the listener
    return () => {
      const index = this.connectionStateListeners.indexOf(listener);
      if (index !== -1) {
        this.connectionStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }
}

// Singleton instance of the subscription manager
let globalSubscriptionManager: SubscriptionManager | null = null;

/**
 * Initialize the global subscription manager
 */
export function initSubscriptionManager(
  queryClient: QueryClient,
  endpoint: string = DEFAULT_WS_ENDPOINT
): SubscriptionManager {
  if (!globalSubscriptionManager) {
    globalSubscriptionManager = new SubscriptionManager(queryClient, endpoint);
  }
  return globalSubscriptionManager;
}

/**
 * Get the global subscription manager instance
 */
export function getSubscriptionManager(): SubscriptionManager | null {
  return globalSubscriptionManager;
}

/**
 * Hook to access and initialize the subscription manager
 */
export function useSubscriptionManager(): SubscriptionManager {
  const queryClient = useQueryClient();
  
  // Initialize on first use if not already initialized
  if (!globalSubscriptionManager) {
    globalSubscriptionManager = new SubscriptionManager(queryClient);
  }
  
  return globalSubscriptionManager;
}

/**
 * Hook to use WebSocket connection state
 */
export function useConnectionState(): ConnectionState {
  const manager = useSubscriptionManager();
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    manager.getConnectionState()
  );
  
  useEffect(() => {
    // Add listener for connection state changes
    const removeListener = manager.addConnectionStateListener(setConnectionState);
    
    // Initial connection if not already connected
    if (manager.getConnectionState() === ConnectionState.DISCONNECTED) {
      manager.connect();
    }
    
    return () => {
      removeListener();
    };
  }, [manager]);
  
  return connectionState;
}

/**
 * Hook for subscribing to real-time updates for a resource
 */
export function useSubscription<TData = any>({
  resource,
  id,
  queryKey,
  onMessage,
  enabled = true,
}: SubscriptionConfig): ConnectionState {
  const manager = useSubscriptionManager();
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    manager.getConnectionState()
  );
  
  // Keep a stable reference to the config
  const configRef = useRef<SubscriptionConfig>({
    resource,
    id,
    queryKey,
    onMessage,
    enabled,
  });
  
  // Update the ref when props change
  useEffect(() => {
    configRef.current = {
      resource,
      id,
      queryKey,
      onMessage,
      enabled,
    };
  }, [resource, id, queryKey, onMessage, enabled]);
  
  useEffect(() => {
    // Don't subscribe if not enabled
    if (!enabled) return;
    
    // Add listener for connection state changes
    const removeStateListener = manager.addConnectionStateListener(setConnectionState);
    
    // Subscribe to the resource
    const unsubscribe = manager.subscribe(configRef.current);
    
    // Connect if not already connected
    if (manager.getConnectionState() === ConnectionState.DISCONNECTED) {
      manager.connect();
    }
    
    return () => {
      unsubscribe();
      removeStateListener();
    };
  }, [manager, enabled]);
  
  return connectionState;
}

/**
 * Example implementation for a real-time query hook
 * 
 * This combines React Query with WebSocket subscriptions
 */
export function useRealtimeQuery<TData = any, TError = unknown>({
  queryKey,
  queryFn,
  resource,
  id,
  subscriptionEnabled = true,
  ...queryOptions
}: {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  resource: string;
  id?: string;
  subscriptionEnabled?: boolean;
  // Allow passing any other React Query options
  [key: string]: any;
}) {
  const queryClient = useQueryClient();
  
  // Set up standard React Query
  const queryResult = queryClient.fetchQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  });
  
  // Set up real-time subscription
  const connectionState = useSubscription({
    resource,
    id,
    queryKey,
    enabled: subscriptionEnabled,
  });
  
  return {
    ...queryResult,
    connectionState,
    isRealtimeConnected: connectionState === ConnectionState.CONNECTED,
  };
} 