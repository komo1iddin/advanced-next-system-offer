import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { AppError } from '@/lib/utils/error';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const requireAuth = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new AppError(401, 'Authentication required');
  }
  
  return session;
};

export const requireAdmin = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  console.log('[requireAdmin] Checking admin access...');
  console.log('[requireAdmin] Session object:', JSON.stringify(session, null, 2));
  console.log('[requireAdmin] User raw data:', session?.user);
  console.log('[requireAdmin] User role found:', session?.user?.role);
  console.log('[requireAdmin] User role type:', typeof session?.user?.role);
  
  // Check if user has admin or super-admin role
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super-admin';
  console.log('[requireAdmin] Is admin?', isAdmin);
  
  if (!session || !session.user || !isAdmin) {
    console.error('[requireAdmin] Admin access denied. Role found:', session?.user?.role);
    throw new AppError(403, 'Admin access required');
  }
  
  console.log('[requireAdmin] Admin access granted for:', session.user.email);
  return session;
};

export const requireAgent = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'agent') {
    throw new AppError(403, 'Agent access required');
  }
  
  return session;
};

export const requireUniversityDirect = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'university_direct') {
    throw new AppError(403, 'University direct access required');
  }
  
  return session;
}; 