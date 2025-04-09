// Service Worker version for cache busting
const CACHE_VERSION = 'v1';
const CACHE_NAME = `study-bridge-cache-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/favicon.ico',
  '/manifest.json',
];

// API routes to cache for offline use
const API_ROUTES = [
  '/api/study-offers',
  '/api/universities',
];

// Installation event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache static assets
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('study-bridge-cache-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Helper to create a network request with timeout
const timeoutFetch = (request, timeoutMs = 8000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Network request timed out'));
    }, timeoutMs);
    
    fetch(request).then(
      (response) => {
        clearTimeout(timeoutId);
        resolve(response);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
};

// Create a response for offline pages
const createOfflineResponse = () => {
  return caches.match('/offline');
};

// Fetch event - network first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Different strategies based on request type
  if (STATIC_ASSETS.includes(url.pathname)) {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
    return;
  }
  
  // For API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      timeoutFetch(event.request)
        .then((response) => {
          // Cache a clone of the response
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch((error) => {
          console.warn('Network request failed, falling back to cache', error);
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || createOfflineResponse();
          });
        })
    );
    return;
  }
  
  // General network-first strategy for everything else
  event.respondWith(
    timeoutFetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || createOfflineResponse();
        });
      })
  );
});

// Store offline mutations in IndexedDB
const DB_NAME = 'offline-mutations';
const STORE_NAME = 'mutations';

// Open IndexedDB for offline mutations
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Add mutation to the queue
const addMutationToQueue = async (mutation) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  store.add({
    ...mutation,
    timestamp: Date.now(),
  });
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// Process the mutation queue
const processMutationQueue = async () => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const mutations = await store.getAll();
  
  for (const mutation of mutations) {
    try {
      // Try to replay the mutation
      const response = await fetch(mutation.url, {
        method: mutation.method,
        headers: mutation.headers,
        body: mutation.body,
      });
      
      if (response.ok) {
        // If successful, remove from the queue
        store.delete(mutation.id);
      }
    } catch (error) {
      console.error('Failed to process offline mutation', error);
      // Keep in queue for next attempt
    }
  }
};

// Sync event to process offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(processMutationQueue());
  }
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_API_RESPONSE') {
    const { url, response } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(url, new Response(JSON.stringify(response)));
    });
  }
  
  if (event.data && event.data.type === 'ADD_MUTATION') {
    addMutationToQueue(event.data.mutation);
    // Try to register a sync if supported
    self.registration.sync.register('sync-mutations').catch(() => {
      // If sync registration fails, try to process immediately
      processMutationQueue();
    });
  }
});
