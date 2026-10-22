import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.wishlist.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: 'All wishlist items cleared',
      data: { count: 0 },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear wishlist' },
      { status: 500 }
    );
  }
});
