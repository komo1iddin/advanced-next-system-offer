import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { AppError } from '@/lib/utils/error';

export const requireAuth = async (req: NextRequest) => {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    throw new AppError(401, 'Authentication required');
  }
  
  return session;
};

export const requireAdmin = async (req: NextRequest) => {
  const session = await getServerSession();
  
  if (!session || !session.user || session.user.role !== 'admin') {
    throw new AppError(403, 'Admin access required');
  }
  
  return session;
};

export const requireAgent = async (req: NextRequest) => {
  const session = await getServerSession();
  
  if (!session || !session.user || session.user.role !== 'agent') {
    throw new AppError(403, 'Agent access required');
  }
  
  return session;
};

export const requireUniversityDirect = async (req: NextRequest) => {
  const session = await getServerSession();
  
  if (!session || !session.user || session.user.role !== 'university_direct') {
    throw new AppError(403, 'University direct access required');
  }
  
  return session;
}; 