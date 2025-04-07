import { dbManager } from '../db/mongoose';
import StudyOffer from '../models/StudyOffer';
import { cacheService } from './CacheService';
import { logService } from './LogService';
import { AppError } from '../utils/AppError';

export class StudyOfferService {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly CACHE_PREFIX = 'study_offer:';

  static async getStudyOffers(query: any) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(query)}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from database
      const studyOffers = await StudyOffer.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // Cache the results
      await cacheService.set(cacheKey, studyOffers, this.CACHE_TTL);

      return studyOffers;
    } catch (error) {
      logService.error('Error in getStudyOffers:', error);
      throw new AppError('Failed to fetch study offers', 500);
    }
  }

  static async getStudyOfferById(id: string) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from database
      const studyOffer = await StudyOffer.findById(id).lean();
      
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
      const studyOffer = new StudyOffer({
        ...data,
        createdBy: user.id
      });

      await studyOffer.save();

      // Clear the list cache
      await cacheService.clearPattern(`${this.CACHE_PREFIX}list:*`);

      return studyOffer;
    } catch (error) {
      logService.error('Error in createStudyOffer:', error);
      throw new AppError('Failed to create study offer', 500);
    }
  }

  static async updateStudyOffer(id: string, data: any, user: any) {
    try {
      const studyOffer = await StudyOffer.findById(id);
      
      if (!studyOffer) {
        throw new AppError('Study offer not found', 404);
      }

      // Check if user has permission to update
      if (studyOffer.createdBy.toString() !== user.id) {
        throw new AppError('Unauthorized to update this study offer', 403);
      }

      Object.assign(studyOffer, data);
      await studyOffer.save();

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
      const studyOffer = await StudyOffer.findById(id);
      
      if (!studyOffer) {
        throw new AppError('Study offer not found', 404);
      }

      // Check if user has permission to delete
      if (studyOffer.createdBy.toString() !== user.id) {
        throw new AppError('Unauthorized to delete this study offer', 403);
      }

      await studyOffer.deleteOne();

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