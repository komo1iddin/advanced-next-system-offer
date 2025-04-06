import { StudyOffer } from '@/lib/models/StudyOffer';
import { generateUniqueId } from '@/lib/generateUniqueId';
import { IStudyOffer } from '@/lib/models/StudyOffer';
import { AppError } from '@/lib/utils/error';
import { cacheService } from './CacheService';
import { logService } from './LogService';

export class StudyOfferService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'study_offer:';

  async createOffer(data: Partial<IStudyOffer>) {
    try {
      logService.info('Creating new study offer', { data });

      // Generate unique ID
      let uniqueId = generateUniqueId(data.degreeLevel || '');
      let isUnique = false;
      let maxAttempts = 5;

      while (!isUnique && maxAttempts > 0) {
        const existingOffer = await StudyOffer.findOne({ uniqueId });
        if (!existingOffer) {
          isUnique = true;
        } else {
          uniqueId = generateUniqueId(data.degreeLevel || '');
          maxAttempts--;
        }
      }

      if (!isUnique) {
        throw new AppError(500, 'Failed to generate a unique ID');
      }

      const offerData = {
        ...data,
        uniqueId
      };

      const newOffer = await StudyOffer.create(offerData);
      
      // Clear relevant caches
      await this.clearCaches();

      logService.info('Study offer created successfully', { id: newOffer._id });
      return newOffer;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to create study offer');
    }
  }

  async getOffers(filters: any = {}, page = 1, limit = 50) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(filters)}:${page}:${limit}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logService.info('Retrieved study offers from cache', { cacheKey });
        return cachedData;
      }

      logService.info('Fetching study offers from database', { filters, page, limit });
      
      const skip = (page - 1) * limit;
      
      const offers = await StudyOffer.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
        
      const total = await StudyOffer.countDocuments(filters);

      const result = {
        data: offers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };

      // Cache the result
      await cacheService.set(cacheKey, result, this.CACHE_TTL);
      
      return result;
    } catch (error) {
      logService.logError(error as Error);
      throw new AppError(500, 'Failed to fetch study offers');
    }
  }

  async getOfferById(id: string) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      
      // Try to get from cache first
      const cachedOffer = await cacheService.get(cacheKey);
      if (cachedOffer) {
        logService.info('Retrieved study offer from cache', { id });
        return cachedOffer;
      }

      logService.info('Fetching study offer from database', { id });

      const offer = await StudyOffer.findById(id)
        .populate('cityId')
        .populate('provinceId')
        .populate('agentId')
        .populate('universityDirectId')
        .lean();

      if (!offer) {
        throw new AppError(404, 'Study offer not found');
      }

      // Cache the result
      await cacheService.set(cacheKey, offer, this.CACHE_TTL);

      return offer;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch study offer');
    }
  }

  async updateOffer(id: string, data: Partial<IStudyOffer>) {
    try {
      logService.info('Updating study offer', { id, data });

      const offer = await StudyOffer.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!offer) {
        throw new AppError(404, 'Study offer not found');
      }

      // Clear relevant caches
      await this.clearCaches();

      logService.info('Study offer updated successfully', { id });
      return offer;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update study offer');
    }
  }

  async deleteOffer(id: string) {
    try {
      logService.info('Deleting study offer', { id });

      const offer = await StudyOffer.findByIdAndDelete(id);

      if (!offer) {
        throw new AppError(404, 'Study offer not found');
      }

      // Clear relevant caches
      await this.clearCaches();

      logService.info('Study offer deleted successfully', { id });
      return { success: true };
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete study offer');
    }
  }

  private async clearCaches(): Promise<void> {
    try {
      await cacheService.clearPattern(`${this.CACHE_PREFIX}*`);
      logService.info('Cleared study offer caches');
    } catch (error) {
      logService.error('Failed to clear caches', { error });
    }
  }
} 