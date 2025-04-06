import { dbManager } from '../db/mongoose';
import StudyOffer from '../models/StudyOffer';
import { CacheService } from './CacheService';
import { LogService } from './LogService';
import { AppError } from '../utils/AppError';

export class StudyOfferService {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly CACHE_PREFIX = 'study_offer:';

  static async getStudyOffers(query: any) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(query)}`;
      
      // Try to get from cache first
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Build optimized query
      const { page = 1, limit = 10, search, ...filters } = query;
      const skip = (page - 1) * limit;

      // Create base query
      const baseQuery = StudyOffer.find(filters);

      // Add text search if provided
      if (search) {
        baseQuery.find({ $text: { $search: search } });
      }

      // Add sorting
      baseQuery.sort({ createdAt: -1 });

      // Add pagination
      baseQuery.skip(skip).limit(limit);

      // Add field selection
      baseQuery.select('-__v');

      // Add population
      baseQuery.populate('cityId', 'name')
               .populate('provinceId', 'name code')
               .populate('agentId', 'name email')
               .populate('universityDirectId', 'name email');

      // Execute query
      const [data, total] = await Promise.all([
        baseQuery.exec(),
        StudyOffer.countDocuments(filters)
      ]);

      const result = { data, total };

      // Cache the result
      await CacheService.set(cacheKey, result, this.CACHE_TTL);

      return result;
    } catch (error) {
      LogService.error('Error getting study offers:', error);
      throw new AppError('DATABASE_ERROR', 'Failed to get study offers', 500, error);
    }
  }

  static async getStudyOfferById(id: string) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      
      // Try to get from cache first
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Build optimized query
      const studyOffer = await StudyOffer.findById(id)
        .select('-__v')
        .populate('cityId', 'name')
        .populate('provinceId', 'name code')
        .populate('agentId', 'name email')
        .populate('universityDirectId', 'name email')
        .lean();

      if (studyOffer) {
        // Cache the result
        await CacheService.set(cacheKey, studyOffer, this.CACHE_TTL);
      }

      return studyOffer;
    } catch (error) {
      LogService.error('Error getting study offer:', error);
      throw new AppError('DATABASE_ERROR', 'Failed to get study offer', 500, error);
    }
  }

  static async createStudyOffer(data: any, user: any) {
    try {
      // Use transaction for data consistency
      return await dbManager.withTransaction(async (session) => {
        // Create study offer
        const studyOffer = new StudyOffer({
          ...data,
          createdBy: user._id
        });

        // Save with transaction
        await studyOffer.save({ session });

        // Clear relevant cache
        await CacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

        return studyOffer;
      });
    } catch (error) {
      LogService.error('Error creating study offer:', error);
      throw new AppError('DATABASE_ERROR', 'Failed to create study offer', 500, error);
    }
  }

  static async updateStudyOffer(id: string, data: any, user: any) {
    try {
      // Use transaction for data consistency
      return await dbManager.withTransaction(async (session) => {
        // Find and update study offer
        const studyOffer = await StudyOffer.findByIdAndUpdate(
          id,
          {
            ...data,
            updatedBy: user._id,
            updatedAt: new Date()
          },
          { new: true, session }
        );

        if (!studyOffer) {
          return null;
        }

        // Clear relevant cache
        await CacheService.clearPattern(`${this.CACHE_PREFIX}${id}`);
        await CacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

        return studyOffer;
      });
    } catch (error) {
      LogService.error('Error updating study offer:', error);
      throw new AppError('DATABASE_ERROR', 'Failed to update study offer', 500, error);
    }
  }

  static async deleteStudyOffer(id: string, user: any) {
    try {
      // Use transaction for data consistency
      return await dbManager.withTransaction(async (session) => {
        // Find and delete study offer
        const studyOffer = await StudyOffer.findByIdAndDelete(id, { session });

        if (!studyOffer) {
          return false;
        }

        // Clear relevant cache
        await CacheService.clearPattern(`${this.CACHE_PREFIX}${id}`);
        await CacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

        return true;
      });
    } catch (error) {
      LogService.error('Error deleting study offer:', error);
      throw new AppError('DATABASE_ERROR', 'Failed to delete study offer', 500, error);
    }
  }
} 