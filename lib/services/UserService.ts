import { User, IUser } from '@/lib/models/User';
import { AppError } from '@/lib/utils/error';
import { cacheService } from './CacheService';
import { logService } from './LogService';
import mongoose from 'mongoose';

type UserRole = 'super-admin' | 'admin' | 'manager' | 'user';

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  avatar?: string;
  agentId?: string;
  universityDirectId?: string;
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  avatar?: string;
  agentId?: string;
  universityDirectId?: string;
}

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

  private convertToObjectId(id?: string): mongoose.Types.ObjectId | undefined {
    if (!id) return undefined;
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (error) {
      throw new AppError(400, 'Invalid ID format');
    }
  }

  async getUsers(query: any, skip: number, limit: number, requesterRole: UserRole) {
    try {
      logService.info('Fetching users', { query, skip, limit });

      // Build the query with role-based access control
      const finalQuery = { ...query };
      if (requesterRole !== 'super-admin') {
        // Only super-admin can see all users
        // Others can only see users with lower roles
        const allowedRoles = ['user'];
        if (requesterRole === 'admin') allowedRoles.push('manager');
        if (requesterRole === 'manager') allowedRoles.push('user');
        finalQuery.role = { $in: allowedRoles };
      }

      const users = await User.find(finalQuery)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      return users;
    } catch (error) {
      logService.logError(error as Error);
      throw new AppError(500, 'Failed to fetch users');
    }
  }

  async countUsers(query: any) {
    try {
      return await User.countDocuments(query);
    } catch (error) {
      logService.logError(error as Error);
      throw new AppError(500, 'Failed to count users');
    }
  }

  async createUser(data: CreateUserData, requesterRole: UserRole) {
    try {
      logService.info('Creating new user', { email: data.email });

      // Check if requester has permission to create user with specified role
      if (data.role && !this.canManageUser(requesterRole, data.role)) {
        throw new AppError(403, 'Insufficient permissions to create user with this role');
      }

      // Convert string IDs to ObjectId
      const userData: Partial<IUser> = {
        ...data,
        agentId: this.convertToObjectId(data.agentId),
        universityDirectId: this.convertToObjectId(data.universityDirectId)
      };

      const user = await User.create(userData);
      
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

  async updateUser(id: string, data: UpdateUserData, requesterRole: UserRole) {
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
      if (data.role && !this.canManageUser(requesterRole, data.role)) {
        throw new AppError(403, 'Insufficient permissions to change user role');
      }

      // Convert string IDs to ObjectId
      const updateData: Partial<IUser> = {
        ...data,
        agentId: this.convertToObjectId(data.agentId),
        universityDirectId: this.convertToObjectId(data.universityDirectId),
        updatedAt: new Date()
      };

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
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