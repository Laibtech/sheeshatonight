/**
 * Production Database Backup Script for SheeshaTonight
 * Extracts full database schema and all 21 tables into a timestamped backup directory.
 * Operates strictly non-destructively.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `backup_${timestamp}.json`);
  console.log(`[BACKUP] Starting SheeshaTonight full database backup at ${new Date().toISOString()}...`);

  const prisma = new PrismaClient();

  try {
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

    const dumpData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.2.0',
        environment: process.env.NODE_ENV || 'production',
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

    fs.writeFileSync(backupFilePath, JSON.stringify(dumpData, null, 2), 'utf-8');
    console.log(`✅ [BACKUP SUCCESS] Comprehensive backup safely saved to:\n   ${backupFilePath}`);
    console.log('[BACKUP SUMMARY] All 21 operational tables exported:');
    console.table(dumpData.metadata.recordCounts);

  } catch (error) {
    console.error('❌ [BACKUP FAILED]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
