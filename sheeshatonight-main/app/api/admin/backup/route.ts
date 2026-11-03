import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * GET /api/admin/backup
 * List available backups or verify a specific backup file
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    ensureBackupDir();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const fileName = searchParams.get('file');

    if (action === 'verify' && fileName) {
      // Clean filename to prevent path traversal
      const safeName = path.basename(fileName);
      const filePath = path.join(BACKUP_DIR, safeName);

      if (!fs.existsSync(filePath)) {
        return errorResponse('Backup file not found', 404);
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const backupData = JSON.parse(fileContent);

      return successResponse(
        {
          fileName: safeName,
          verified: true,
          metadata: backupData.metadata,
          tablesPresent: Object.keys(backupData.tables || {}),
        },
        'Backup verification successful'
      );
    }

    // Default: List all available backups
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const fullPath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(fullPath);
        return {
          fileName: f,
          sizeBytes: stats.size,
          sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
          createdAt: stats.birthtime.toISOString(),
          lastModified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(
      {
        backups: files,
        totalBackups: files.length,
        storageDirectory: 'backups/ (secure, non-public)',
      },
      'Available backups retrieved successfully'
    );
  } catch (error: any) {
    console.error('Admin backup GET error:', error);
    return errorResponse('Failed to retrieve backups list', 500);
  }
});

/**
 * POST /api/admin/backup
 * Trigger manual database backup of all 21 operational tables
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.json`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    const [
      users,
      vendors,
      vendorDocuments,
      products,
      orders,
      orderItems,
      orderTrackings,
      invoices,
      settlements,
      addresses,
      carts,
      wishlists,
      notifications,
      auditLogs,
      categories,
      coupons,
      reviews,
      cmsBanners,
      cmsPages,
      cmsContents,
      platformSettings,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.vendor.findMany(),
      prisma.vendorDocument.findMany(),
      prisma.product.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.orderTracking.findMany(),
      prisma.invoice.findMany(),
      prisma.settlement.findMany(),
      prisma.address.findMany(),
      prisma.cart.findMany(),
      prisma.wishlist.findMany(),
      prisma.notification.findMany(),
      prisma.auditLog.findMany(),
      prisma.category.findMany(),
      prisma.coupon.findMany(),
      prisma.review.findMany(),
      prisma.cmsBanner.findMany(),
      prisma.cmsPage.findMany(),
      prisma.cmsContent.findMany(),
      prisma.platformSetting.findMany(),
    ]);

    const backupDump = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.2.0',
        environment: process.env.NODE_ENV || 'production',
        tablesCount: 21,
        recordCounts: {
          users: users.length,
          vendors: vendors.length,
          vendorDocuments: vendorDocuments.length,
          products: products.length,
          orders: orders.length,
          orderItems: orderItems.length,
          orderTrackings: orderTrackings.length,
          invoices: invoices.length,
          settlements: settlements.length,
          addresses: addresses.length,
          carts: carts.length,
          wishlists: wishlists.length,
          notifications: notifications.length,
          auditLogs: auditLogs.length,
          categories: categories.length,
          coupons: coupons.length,
          reviews: reviews.length,
          cmsBanners: cmsBanners.length,
          cmsPages: cmsPages.length,
          cmsContents: cmsContents.length,
          platformSettings: platformSettings.length,
        },
      },
      tables: {
        users,
        vendors,
        vendorDocuments,
        products,
        orders,
        orderItems,
        orderTrackings,
        invoices,
        settlements,
        addresses,
        carts,
        wishlists,
        notifications,
        auditLogs,
        categories,
        coupons,
        reviews,
        cmsBanners,
        cmsPages,
        cmsContents,
        platformSettings,
      },
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupDump, null, 2), 'utf-8');

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || users[0]?.id || 'system',
          action: 'MANUAL_DATABASE_BACKUP',
          resourceType: 'DATABASE',
          resourceId: backupFileName,
          beforeState: null,
          afterState: JSON.stringify(backupDump.metadata.recordCounts),
        },
      });
    } catch {
      // Non-blocking
    }

    return successResponse(
      {
        fileName: backupFileName,
        timestamp: backupDump.metadata.timestamp,
        tablesCount: 21,
        recordCounts: backupDump.metadata.recordCounts,
      },
      'Manual database backup completed successfully',
      201
    );
  } catch (error: any) {
    console.error('Admin backup POST error:', error);
    return errorResponse(`Failed to generate database backup: ${error.message}`, 500);
  }
});
