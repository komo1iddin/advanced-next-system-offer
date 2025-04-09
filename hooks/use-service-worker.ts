import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';
import { toast } from 'sonner';

export enum ServiceWorkerStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  FAILED = 'failed',
  UNSUPPORTED = 'unsupported',
}

export interface MutationQueueItem {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp?: number;
}

// Extend ServiceWorkerRegistration type to include sync
declare global {
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

/**
 * Hook to register and manage service worker
 */
export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>(ServiceWorkerStatus.PENDING);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wb, setWb] = useState<Workbox | null>(null);

  // Register the service worker
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setStatus(ServiceWorkerStatus.UNSUPPORTED);
      return;
    }

    // Create workbox instance
    const workboxInstance = new Workbox('/sw.js');
    setWb(workboxInstance);

    // Register service worker
    workboxInstance
      .register()
      .then(() => {
        setStatus(ServiceWorkerStatus.REGISTERED);
        console.log('Service worker registered successfully');
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
        setStatus(ServiceWorkerStatus.FAILED);
      });

    // Event listeners for workbox
    workboxInstance.addEventListener('activated', (event) => {
      // If we have a waiting SW and this is a new version, show update toast
      if (event.isUpdate) {
        toast.success('App updated to new version! Refresh for the latest features.', {
          duration: 5000,
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      }
    });

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Cache API response for offline use
   */
  const cacheApiResponse = async (url: string, response: any) => {
    if (!wb || status !== ServiceWorkerStatus.REGISTERED) return;

    try {
      await wb.messageSW({
        type: 'CACHE_API_RESPONSE',
        url,
        response,
      });
    } catch (error) {
      console.error('Failed to cache API response:', error);
    }
  };

  /**
   * Add mutation to offline queue
   */
  const addToMutationQueue = async (mutation: MutationQueueItem) => {
    if (!wb || status !== ServiceWorkerStatus.REGISTERED) return;

    try {
      await wb.messageSW({
        type: 'ADD_MUTATION',
        mutation,
      });
    } catch (error) {
      console.error('Failed to add mutation to queue:', error);
    }
  };

  /**
   * Trigger background sync manually
   */
  const triggerSync = async () => {
    if (!wb || status !== ServiceWorkerStatus.REGISTERED) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if sync is supported
      if (registration.sync && typeof registration.sync.register === 'function') {
        await registration.sync.register('sync-mutations');
        return true;
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
    
    return false;
  };

  return {
    status,
    isOnline,
    cacheApiResponse,
    addToMutationQueue,
    triggerSync,
  };
} 