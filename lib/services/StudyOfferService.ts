import connectToDatabase from '../mongodb';
import StudyOffer from '../models/StudyOffer';
import { getCache } from './CacheFactory';
import { logService } from './LogService';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

// Get the cache implementation
const cacheService = getCache();

// Timeout Promise helper
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AppError(errorMsg, 504)); // Gateway Timeout
    }, timeoutMs);
  });
  
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

export class StudyOfferService {
  private static readonly CACHE_TTL = cacheService.getTTLValue('long'); // 2 hours
  private static readonly CACHE_PREFIX = 'study_offer:';
  private static readonly QUERY_TIMEOUT = 10000; // 10 seconds

  /**
   * Warm the cache with frequently accessed study offers
   */
  static async warmCache(): Promise<void> {
    try {
      // Define the key data to prefetch
      const keysToWarm = [
        {
          key: `${this.CACHE_PREFIX}list:{"page":1,"limit":8}`,
          fetch: async () => {
            // Connect to database
            await connectToDatabase();
            
            // Default query for homepage
            const studyOffers = await StudyOffer.find({})
              .select('title universityName description location degreeLevel programs tuitionFees scholarshipAvailable applicationDeadline tags color accentColor category featured')
              .sort({ createdAt: -1 })
              .limit(8)
              .lean();
              
            const total = await StudyOffer.countDocuments({});
            
            return {
              data: studyOffers,
              total,
              timestamp: new Date().toISOString()
            };
          },
          ttl: this.CACHE_TTL
        },
        {
          key: `${this.CACHE_PREFIX}list:{"featured":true,"page":1,"limit":4}`,
          fetch: async () => {
            // Connect to database
            await connectToDatabase();
            
            // Featured offers query for homepage
            const studyOffers = await StudyOffer.find({ featured: true })
              .select('title universityName description location degreeLevel programs tuitionFees scholarshipAvailable applicationDeadline tags color accentColor category featured')
              .sort({ createdAt: -1 })
              .limit(4)
              .lean();
              
            const total = await StudyOffer.countDocuments({ featured: true });
            
            return {
              data: studyOffers,
              total,
              timestamp: new Date().toISOString()
            };
          },
          ttl: this.CACHE_TTL
        }
        // Add more cache keys as needed
      ];
      
      // Warm the cache
      await cacheService.warmupCache?.(keysToWarm);
    } catch (error) {
      logService.error('Error warming study offers cache:', error);
    }
  }

  static async getStudyOffers(query: any) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(query)}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Ensure we're connected to the database
      await connectToDatabase();

      // If not in cache, fetch from database
      const { page = 1, limit = 10, ...filters } = query;
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Use lean queries with explicit fields and index hints for better performance
      const queryPromise = Promise.all([
        // Query for data with timeout
        withTimeout(
          StudyOffer.find(filters)
            .select('title universityName description location degreeLevel programs tuitionFees scholarshipAvailable applicationDeadline tags color accentColor category featured')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(),
          this.QUERY_TIMEOUT,
          'Database query timeout while fetching study offers'
        ),
        
        // Query for count with timeout
        withTimeout(
          StudyOffer.countDocuments(filters).exec(),
          this.QUERY_TIMEOUT,
          'Database query timeout while counting study offers'
        )
      ]);
      
      // Wait for both queries to complete with overall timeout
      const [studyOffers, total] = await withTimeout(
        queryPromise,
        this.QUERY_TIMEOUT * 1.5, // Allow slightly longer for both queries
        'Database query timeout'
      );
      
      // Create result with pagination data
      const result = {
        data: studyOffers,
        total,
        timestamp: new Date().toISOString()
      };

      // Cache the results with a longer TTL for frequently accessed pages
      if (page === 1 && limit <= 10) {
        // First page queries are accessed more frequently - use longer TTL
        await cacheService.set(cacheKey, result, this.CACHE_TTL);
      } else {
        // Use shorter TTL for other pages
        await cacheService.set(cacheKey, result, cacheService.getTTLValue('medium'));
      }

      return result;
    } catch (error) {
      logService.error('Error in getStudyOffers:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch study offers', 500);
    }
  }

  static async getStudyOfferById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid study offer ID', 400);
      }
      
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Ensure we're connected to the database
      await connectToDatabase();

      // If not in cache, fetch from database with timeout
      const studyOffer = await withTimeout(
        StudyOffer.findById(id).lean().exec(),
        this.QUERY_TIMEOUT,
        'Database query timeout while fetching study offer'
      );
      
      if (!studyOffer) {
        throw new AppError('Study offer not found', 404);
      }

      // Cache the result
      await cacheService.set(cacheKey, studyOffer, this.CACHE_TTL);

      return studyOffer;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logService.error('Error in getStudyOfferById:', error);
      throw new AppError('Failed to fetch study offer', 500);
    }
  }

  static async createStudyOffer(data: any, user: any) {
    try {
      // Ensure we're connected to the database
      await connectToDatabase();
      
      // Generate a unique ID if not provided
      if (!data.uniqueId) {
        data.uniqueId = new mongoose.Types.ObjectId().toString();
      }
      
      const studyOffer = new StudyOffer({
        ...data,
        createdBy: user.id
      });

      // Save with timeout
      await withTimeout(
        studyOffer.save(),
        this.QUERY_TIMEOUT,
        'Database timeout while creating study offer'
      );

      // Clear the list cache
      await cacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

      return studyOffer;
    } catch (error) {
      logService.error('Error in createStudyOffer:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create study offer', 500);
    }
  }

  static async updateStudyOffer(id: string, data: any, user: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid study offer ID', 400);
      }
      
      // Ensure we're connected to the database
      await connectToDatabase();
      
      // Find the study offer with timeout
      const studyOffer = await withTimeout(
        StudyOffer.findById(id).exec(),
        this.QUERY_TIMEOUT,
        'Database timeout while fetching study offer for update'
      );
      
      if (!studyOffer) {
        throw new AppError('Study offer not found', 404);
      }

      // Check if user has permission to update
      if (studyOffer.createdBy.toString() !== user.id) {
        throw new AppError('Unauthorized to update this study offer', 403);
      }

      // Update the document
      Object.assign(studyOffer, data);
      
      // Save with timeout
      await withTimeout(
        studyOffer.save(),
        this.QUERY_TIMEOUT,
        'Database timeout while updating study offer'
      );

      // Clear both the specific cache and list cache
      await cacheService.del(`${this.CACHE_PREFIX}${id}`);
      await cacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

      return studyOffer;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logService.error('Error in updateStudyOffer:', error);
      throw new AppError('Failed to update study offer', 500);
    }
  }

  static async deleteStudyOffer(id: string, user: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid study offer ID', 400);
      }
      
      // Ensure we're connected to the database
      await connectToDatabase();
      
      // Find the study offer with timeout
      const studyOffer = await withTimeout(
        StudyOffer.findById(id).exec(),
        this.QUERY_TIMEOUT,
        'Database timeout while fetching study offer for deletion'
      );
      
      if (!studyOffer) {
        throw new AppError('Study offer not found', 404);
      }

      // Check if user has permission to delete
      if (studyOffer.createdBy.toString() !== user.id) {
        throw new AppError('Unauthorized to delete this study offer', 403);
      }

      // Delete with timeout
      await withTimeout(
        studyOffer.deleteOne(),
        this.QUERY_TIMEOUT,
        'Database timeout while deleting study offer'
      );

      // Clear both the specific cache and list cache
      await cacheService.del(`${this.CACHE_PREFIX}${id}`);
      await cacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logService.error('Error in deleteStudyOffer:', error);
      throw new AppError('Failed to delete study offer', 500);
    }
  }
} 