const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient();

const backupFile = path.join(__dirname, '..', 'backups', 'backup_2026-10-12T05-55-37-587Z.json');

async function restore() {
  console.log(`[RESTORE] Reading backup file: ${backupFile}`);
  const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
  const tables = data.tables;

  console.log('[RESTORE] Restoring users...');
  if (tables.users && tables.users.length) {
    for (const u of tables.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          ...u,
          createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring categories...');
  if (tables.categories && tables.categories.length) {
    for (const c of tables.categories) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: {},
        create: {
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring vendors...');
  if (tables.vendors && tables.vendors.length) {
    for (const v of tables.vendors) {
      await prisma.vendor.upsert({
        where: { id: v.id },
        update: {},
        create: {
          ...v,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
          updatedAt: v.updatedAt ? new Date(v.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring products...');
  if (tables.products && tables.products.length) {
    for (const p of tables.products) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring coupons...');
  if (tables.coupons && tables.coupons.length) {
    for (const c of tables.coupons) {
      await prisma.coupon.upsert({
        where: { id: c.id },
        update: {},
        create: {
          ...c,
          validFrom: c.validFrom ? new Date(c.validFrom) : undefined,
          validUntil: c.validUntil ? new Date(c.validUntil) : undefined,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring orders...');
  if (tables.orders && tables.orders.length) {
    for (const o of tables.orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          ...o,
          rentalStartDate: o.rentalStartDate ? new Date(o.rentalStartDate) : undefined,
          rentalEndDate: o.rentalEndDate ? new Date(o.rentalEndDate) : undefined,
          createdAt: o.createdAt ? new Date(o.createdAt) : undefined,
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring orderItems...');
  if (tables.orderItems && tables.orderItems.length) {
    for (const oi of tables.orderItems) {
      await prisma.orderItem.upsert({
        where: { id: oi.id },
        update: {},
        create: {
          ...oi,
          createdAt: oi.createdAt ? new Date(oi.createdAt) : undefined,
          updatedAt: oi.updatedAt ? new Date(oi.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring orderTrackings...');
  if (tables.orderTrackings && tables.orderTrackings.length) {
    for (const ot of tables.orderTrackings) {
      await prisma.orderTracking.upsert({
        where: { id: ot.id },
        update: {},
        create: {
          ...ot,
          timestamp: ot.timestamp ? new Date(ot.timestamp) : undefined,
          createdAt: ot.createdAt ? new Date(ot.createdAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring invoices...');
  if (tables.invoices && tables.invoices.length) {
    for (const inv of tables.invoices) {
      await prisma.invoice.upsert({
        where: { id: inv.id },
        update: {},
        create: {
          ...inv,
          dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
          createdAt: inv.createdAt ? new Date(inv.createdAt) : undefined,
          updatedAt: inv.updatedAt ? new Date(inv.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring notifications...');
  if (tables.notifications && tables.notifications.length) {
    for (const n of tables.notifications) {
      await prisma.notification.upsert({
        where: { id: n.id },
        update: {},
        create: {
          ...n,
          createdAt: n.createdAt ? new Date(n.createdAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring auditLogs...');
  if (tables.auditLogs && tables.auditLogs.length) {
    for (const a of tables.auditLogs) {
      await prisma.auditLog.upsert({
        where: { id: a.id },
        update: {},
        create: {
          ...a,
          createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring cmsBanners...');
  if (tables.cmsBanners && tables.cmsBanners.length) {
    for (const b of tables.cmsBanners) {
      await prisma.cmsBanner.upsert({
        where: { id: b.id },
        update: {},
        create: {
          ...b,
          startDate: b.startDate ? new Date(b.startDate) : undefined,
          endDate: b.endDate ? new Date(b.endDate) : undefined,
          createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
          updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring cmsPages...');
  if (tables.cmsPages && tables.cmsPages.length) {
    for (const pg of tables.cmsPages) {
      await prisma.cmsPage.upsert({
        where: { id: pg.id },
        update: {},
        create: {
          ...pg,
          createdAt: pg.createdAt ? new Date(pg.createdAt) : undefined,
          updatedAt: pg.updatedAt ? new Date(pg.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring cmsContents...');
  if (tables.cmsContents && tables.cmsContents.length) {
    for (const cc of tables.cmsContents) {
      await prisma.cmsContent.upsert({
        where: { id: cc.id },
        update: {},
        create: {
          ...cc,
          createdAt: cc.createdAt ? new Date(cc.createdAt) : undefined,
          updatedAt: cc.updatedAt ? new Date(cc.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('[RESTORE] Restoring platformSettings...');
  if (tables.platformSettings && tables.platformSettings.length) {
    for (const ps of tables.platformSettings) {
      await prisma.platformSetting.upsert({
        where: { id: ps.id },
        update: {},
        create: {
          ...ps,
          createdAt: ps.createdAt ? new Date(ps.createdAt) : undefined,
          updatedAt: ps.updatedAt ? new Date(ps.updatedAt) : undefined,
        },
      });
    }
  }

  console.log('🎉 [RESTORE SUCCESS] All snapshot records imported successfully!');
}

restore()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
