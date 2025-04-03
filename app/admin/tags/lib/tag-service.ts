// Define the Tag interface
export interface Tag {
  _id: string;
  name: string;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cache mechanism
interface TagsCache {
  data: Tag[] | null;
  timestamp: number;
  promise: Promise<Tag[]> | null;
  requestId: string | null;
}

// Initialize cache
const tagsCache: TagsCache = {
  data: null,
  timestamp: 0,
  promise: null,
  requestId: null
};

// Cache TTL in milliseconds (1 minute)
const CACHE_TTL = 60 * 1000;

// Generate a unique request ID
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 12);
}

// Validate cache
function isCacheValid(cache: TagsCache): boolean {
  return !!cache.data && (Date.now() - cache.timestamp < CACHE_TTL);
}

// Invalidate cache
function invalidateCache() {
  tagsCache.data = null;
  tagsCache.timestamp = 0;
  tagsCache.promise = null;
  tagsCache.requestId = null;
}

// Fetch all tags with caching
export const fetchTags = async (activeOnly: boolean = false, category?: string): Promise<Tag[]> => {
  // Generate a new request ID for this fetch operation
  const requestId = generateRequestId();
  console.log(`Starting tags fetch with ID: ${requestId}`);
  
  // Return cached data if it's still valid
  if (isCacheValid(tagsCache)) {
    console.log(`Using cached tag data (request ID: ${requestId})`);
    
    let result = tagsCache.data!;
    
    // Apply filters to cached data
    if (activeOnly) {
      result = result.filter(tag => tag.active);
    }
    
    if (category) {
      result = result.filter(tag => tag.category === category);
    }
    
    return result;
  }
  
  // If there's already a pending request, return its promise
  if (tagsCache.promise) {
    console.log(`Reusing pending tag fetch request (request ID: ${requestId})`);
    return tagsCache.promise;
  }
  
  try {
    console.log(`Fetching tags from API (request ID: ${requestId})...`);
    
    // Store this request's ID
    tagsCache.requestId = requestId;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (activeOnly) {
      params.append('activeOnly', 'true');
    }
    if (category) {
      params.append('category', category);
    }
    
    // Create a fetch promise with timeout
    const fetchPromise = Promise.race([
      fetch(`/api/tags?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 15s')), 15000)
      ) as Promise<Response>
    ])
    .then(response => {
      console.log(`API response status (request ID: ${requestId}):`, response.status);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.error(`API error response (request ID: ${requestId}):`, text);
          throw new Error(`Failed to fetch tags: ${response.status} ${text}`);
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log(`API response data count (request ID: ${requestId}):`, data?.length || 0);
      
      // Only update cache if this is still the current request
      if (tagsCache.requestId === requestId) {
        if (!Array.isArray(data)) {
          console.error(`Invalid data format received (request ID: ${requestId}):`, data);
          throw new Error("Invalid data format received from API");
        }
        
        // Update cache
        tagsCache.data = data;
        tagsCache.timestamp = Date.now();
        tagsCache.promise = null;
        tagsCache.requestId = null;
        
        return data;
      } else {
        console.log(`Ignoring stale response (request ID: ${requestId})`);
        // This is a response from a previous request, return the data without updating cache
        return data;
      }
    })
    .catch(error => {
      // Clear promise on error, but only if this is still the current request
      if (tagsCache.requestId === requestId) {
        tagsCache.promise = null;
        tagsCache.requestId = null;
      }
      console.error(`Error fetching tags (request ID: ${requestId}):`, error);
      throw error;
    });
    
    // Store the promise in cache
    tagsCache.promise = fetchPromise;
    return fetchPromise;
  } catch (error) {
    console.error(`Error in fetchTags (request ID: ${requestId}):`, error);
    
    // Only invalidate cache if this is still the current request
    if (tagsCache.requestId === requestId) {
      invalidateCache();
    }
    
    throw error;
  }
};

// Add a new tag
export async function addTag(newTag: Omit<Tag, '_id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
  try {
    // Ensure we have a valid category
    const tagData = {
      ...newTag,
      category: newTag.category || 'General'
    };
    
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add tag');
    }
    
    invalidateCache();
    
    return await response.json();
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
}

// Update an existing tag
export async function updateTag(
  tagId: string,
  updates: Partial<Omit<Tag, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Tag> {
  try {
    // Optimistic update
    if (tagsCache.data) {
      const updatedTags = tagsCache.data.map(tag => 
        tag._id === tagId ? { ...tag, ...updates } : tag
      );
      tagsCache.data = updatedTags;
    }
    
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      invalidateCache();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update tag');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating tag:', error);
    invalidateCache();
    throw error;
  }
}

// Delete a tag
export async function deleteTag(tagId: string): Promise<void> {
  try {
    // Optimistic update
    if (tagsCache.data) {
      tagsCache.data = tagsCache.data.filter(tag => tag._id !== tagId);
    }
    
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      invalidateCache();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete tag');
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    invalidateCache();
    throw error;
  }
} 