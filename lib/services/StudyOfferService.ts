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
      const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc', ...filters } = query;
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Build filter object for MongoDB
      const filterObject: any = {};
      
      // Process text search query
      let searchStage = null;
      if (search) {
        searchStage = { $text: { $search: search } };
        // Add to filter object only if no other stages are used
        if (Object.keys(filters).length === 0) {
          Object.assign(filterObject, searchStage);
        }
      }
      
      // Process other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle range filters
          if (key === 'minTuition') {
            filterObject['tuitionFees.amount'] = { ...(filterObject['tuitionFees.amount'] || {}), $gte: Number(value) };
          } else if (key === 'maxTuition') {
            filterObject['tuitionFees.amount'] = { ...(filterObject['tuitionFees.amount'] || {}), $lte: Number(value) };
          } else if (key === 'minDuration') {
            filterObject['durationInYears'] = { ...(filterObject['durationInYears'] || {}), $gte: Number(value) };
          } else if (key === 'maxDuration') {
            filterObject['durationInYears'] = { ...(filterObject['durationInYears'] || {}), $lte: Number(value) };
          } else if (key === 'scholarshipAvailable' || key === 'featured') {
            // Boolean filters
            filterObject[key] = value === 'true' || value === true;
          } else {
            // Regular filters
            filterObject[key] = value;
          }
        }
      });
      
      // Determine which fields to select based on the context
      // List views need less data than detail views
      const projection = {
        _id: 1,
        uniqueId: 1,
        title: 1,
        universityName: 1,
        degreeLevel: 1,
        location: 1,
        'tuitionFees.amount': 1,
        'tuitionFees.currency': 1,
        scholarshipAvailable: 1,
        applicationDeadline: 1,
        featured: 1,
        category: 1,
        color: 1,
        accentColor: 1,
        tags: 1
      };
      
      // If detail level data is requested, add additional fields
      if (query.detail === 'full') {
        Object.assign(projection, {
          description: 1,
          programs: 1,
          'tuitionFees.period': 1,
          scholarshipDetails: 1,
          languageRequirements: 1,
          durationInYears: 1,
          campusFacilities: 1,
          admissionRequirements: 1,
          images: 1,
          cityId: 1,
          provinceId: 1,
          source: 1,
          createdAt: 1,
          updatedAt: 1
        });
      }
      
      // Determine sort order
      const sortOption: any = {};
      
      // Handle special case for text search relevance sorting
      if (searchStage && !sort) {
        sortOption.score = { $meta: 'textScore' };
        Object.assign(projection, { score: { $meta: 'textScore' } });
      } else {
        // Regular sorting
        sortOption[sort] = order === 'desc' ? -1 : 1;
      }
      
      // Build the query with proper index hints
      let query$ = StudyOffer.find(filterObject);
      
      // Apply index hints based on filter criteria to help MongoDB optimizer
      if (searchStage) {
        query$ = query$.hint('text_search_idx');
      } else if (filters.degreeLevel && filters.category) {
        query$ = query$.hint('degree_category_idx');
      } else if (filters.degreeLevel && filters.scholarshipAvailable) {
        query$ = query$.hint('degree_scholarship_idx');
      } else if (filters.featured) {
        query$ = query$.hint('featured_created_idx');
      } else if (filters.location && filters.degreeLevel) {
        query$ = query$.hint('location_degree_idx');
      } else if (filters.degreeLevel && (filters.minTuition || filters.maxTuition)) {
        query$ = query$.hint('degree_tuition_idx');
      } else if (filters.degreeLevel && (filters.minDuration || filters.maxDuration)) {
        query$ = query$.hint('degree_duration_idx');
      } else if (filters.location && (filters.minTuition || filters.maxTuition)) {
        query$ = query$.hint('location_tuition_idx');
      } else if (filters.scholarshipAvailable && (filters.minTuition || filters.maxTuition)) {
        query$ = query$.hint('scholarship_tuition_idx');
      } else if ((filters.minTuition || filters.maxTuition) && sort === 'createdAt') {
        query$ = query$.hint('tuition_created_idx');
      } else if ((filters.minDuration || filters.maxDuration) && sort === 'createdAt') {
        query$ = query$.hint('duration_created_idx');
      } else if (filters.degreeLevel && filters.scholarshipAvailable && filters.featured) {
        query$ = query$.hint('multi_criteria_idx');
      } else if (filters.language && filters.degreeLevel) {
        query$ = query$.hint('language_degree_idx');
      }
      
      // Use Promise.all for parallel execution of both queries
      const queryPromise = Promise.all([
        // Query for data with timeout
        withTimeout(
          query$
            .select(projection)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(),
          this.QUERY_TIMEOUT,
          'Database query timeout while fetching study offers'
        ),
        
        // Query for count with timeout - use countDocuments for better performance
        withTimeout(
          StudyOffer.countDocuments(filterObject).exec(),
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

      // Determine if we need a lean query (better performance) or full document
      const projection = {
        _id: 1,
        uniqueId: 1,
        title: 1,
        universityName: 1,
        description: 1,
        location: 1,
        cityId: 1,
        provinceId: 1,
        degreeLevel: 1,
        programs: 1,
        tuitionFees: 1,
        scholarshipAvailable: 1,
        scholarshipDetails: 1,
        applicationDeadline: 1,
        languageRequirements: 1,
        durationInYears: 1,
        campusFacilities: 1,
        admissionRequirements: 1,
        tags: 1,
        color: 1,
        accentColor: 1,
        category: 1,
        source: 1,
        images: 1,
        featured: 1,
        createdAt: 1,
        updatedAt: 1
      };

      // If not in cache, fetch from database with timeout
      const studyOffer = await withTimeout(
        StudyOffer.findById(id)
          .select(projection)
          .lean()
          .exec(),
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