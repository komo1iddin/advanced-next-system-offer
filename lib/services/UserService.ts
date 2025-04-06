import { User, IUser } from '@/lib/models/User';
import { AppError } from '@/lib/utils/error';
import { cacheService } from './CacheService';
import { logService } from './LogService';

type UserRole = 'super-admin' | 'admin' | 'manager' | 'user';

export class UserService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'user:';

  private canManageUser(requesterRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'super-admin': 4,
      'admin': 3,
      'manager': 2,
      'user': 1
    };
    return roleHierarchy[requesterRole] > roleHierarchy[targetRole];
  }

  async createUser(data: Partial<IUser>, requesterRole: UserRole) {
    try {
      logService.info('Creating new user', { email: data.email });

      // Check if requester has permission to create user with specified role
      if (data.role && !this.canManageUser(requesterRole, data.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to create user with this role');
      }

      const user = await User.create(data);
      
      // Clear relevant caches
      await this.clearCaches();

      logService.info('User created successfully', { id: user._id });
      return user;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to create user');
    }
  }

  async getUserById(id: string, requesterRole: UserRole) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      
      // Try to get from cache first
      const cachedUser = await cacheService.get(cacheKey);
      if (cachedUser) {
        logService.info('Retrieved user from cache', { id });
        return cachedUser;
      }

      logService.info('Fetching user from database', { id });

      const user = await User.findById(id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Check if requester has permission to view this user
      if (!this.canManageUser(requesterRole, user.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to view this user');
      }

      // Cache the result
      await cacheService.set(cacheKey, user, this.CACHE_TTL);

      return user;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch user');
    }
  }

  async getUserByEmail(email: string, requesterRole: UserRole) {
    try {
      const cacheKey = `${this.CACHE_PREFIX}email:${email}`;
      
      // Try to get from cache first
      const cachedUser = await cacheService.get(cacheKey);
      if (cachedUser) {
        logService.info('Retrieved user from cache', { email });
        return cachedUser;
      }

      logService.info('Fetching user from database', { email });

      const user = await User.findOne({ email })
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Check if requester has permission to view this user
      if (!this.canManageUser(requesterRole, user.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to view this user');
      }

      // Cache the result
      await cacheService.set(cacheKey, user, this.CACHE_TTL);

      return user;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch user');
    }
  }

  async updateUser(id: string, data: Partial<IUser>, requesterRole: UserRole) {
    try {
      logService.info('Updating user', { id });

      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }

      // Check if requester has permission to update this user
      if (!this.canManageUser(requesterRole, existingUser.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to update this user');
      }

      // Check if requester has permission to change role
      if (data.role && !this.canManageUser(requesterRole, data.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to change user role');
      }

      const user = await User.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');

      // Clear relevant caches
      await this.clearCaches();

      logService.info('User updated successfully', { id });
      return user;
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update user');
    }
  }

  async deleteUser(id: string, requesterRole: UserRole) {
    try {
      logService.info('Deleting user', { id });

      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new AppError(404, 'User not found');
      }

      // Check if requester has permission to delete this user
      if (!this.canManageUser(requesterRole, existingUser.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to delete this user');
      }

      const user = await User.findByIdAndDelete(id);

      // Clear relevant caches
      await this.clearCaches();

      logService.info('User deleted successfully', { id });
      return { success: true };
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete user');
    }
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string, requesterRole: UserRole) {
    try {
      logService.info('Updating user password', { id });

      const user = await User.findById(id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Check if requester has permission to update this user's password
      if (!this.canManageUser(requesterRole, user.role as UserRole)) {
        throw new AppError(403, 'Insufficient permissions to update this user\'s password');
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AppError(400, 'Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      // Clear relevant caches
      await this.clearCaches();

      logService.info('User password updated successfully', { id });
      return { success: true };
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update password');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      logService.info('Resetting user password', { token });

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError(400, 'Invalid or expired reset token');
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Clear relevant caches
      await this.clearCaches();

      logService.info('User password reset successfully', { id: user._id });
      return { success: true };
    } catch (error) {
      logService.logError(error as Error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to reset password');
    }
  }

  private async clearCaches(): Promise<void> {
    try {
      await cacheService.clearPattern(`${this.CACHE_PREFIX}*`);
      logService.info('Cleared user caches');
    } catch (error) {
      logService.error('Failed to clear caches', { error });
    }
  }
} 
} 