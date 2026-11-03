const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepAudit() {
  console.log('=== SHEESHATONIGHT COMPREHENSIVE DATABASE AUDIT ===');
  console.log('Timestamp:', new Date().toISOString());

  // 1. Connection check & database name
  const dbInfo = await prisma.$queryRawUnsafe('SELECT DATABASE() as db, VERSION() as version');
  console.log('\n[1] ACTIVE DATABASE CONNECTION:');
  console.log('Database Name:', dbInfo[0].db);
  console.log('MySQL/MariaDB Version:', dbInfo[0].version);

  // 2. All tables in schema
  const rawTables = await prisma.$queryRawUnsafe('SHOW FULL TABLES');
  const tableKey = Object.keys(rawTables[0])[0];
  const typeKey = Object.keys(rawTables[0])[1];
  const tables = rawTables.map(t => ({ name: t[tableKey], type: t[typeKey] }));
  console.log('\n[2] DATABASE TABLES (Total: ' + tables.length + '):');
  console.log(tables.map(t => t.name).join(', '));

  // 3. Model verification
  const models = [
    'User', 'Vendor', 'VendorDocument', 'Product', 'Order', 'OrderItem',
    'OrderTracking', 'Invoice', 'Settlement', 'Address', 'Cart', 'Wishlist',
    'Notification', 'AuditLog', 'Category', 'Coupon', 'Review',
    'CmsBanner', 'CmsPage', 'CmsContent', 'PlatformSetting'
  ];

  console.log('\n[3] PRISMA MODEL VS DATABASE VERIFICATION:');
  const results = [];
  for (const m of models) {
    const prop = m[0].toLowerCase() + m.slice(1);
    try {
      const count = await prisma[prop].count();
      results.push({ Model: m, Status: 'OK', Records: count });
    } catch (e) {
      results.push({ Model: m, Status: 'FAIL', Records: e.message });
    }
  }
  console.table(results);

  // 4. Foreign key integrity check
  console.log('\n[4] FOREIGN KEYS & CONSTRAINTS:');
  const fks = await prisma.$queryRawUnsafe(`
    SELECT 
      TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
  `);
  console.log(`Total Foreign Key Constraints: ${fks.length}`);
  console.table(fks.slice(0, 15));

  // 5. Check indexes
  console.log('\n[5] INDEX COVERAGE:');
  const indexes = await prisma.$queryRawUnsafe(`
    SELECT DISTINCT TABLE_NAME, INDEX_NAME, NON_UNIQUE
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
  `);
  console.log(`Total Distinct Indexes: ${indexes.length}`);

  // 6. Migrations status
  console.log('\n[6] PRISMA MIGRATIONS STATUS:');
  try {
    const migrations = await prisma.$queryRawUnsafe('SELECT * FROM _prisma_migrations ORDER BY applied_steps_count DESC');
    console.log(`Applied migrations count: ${migrations.length}`);
    migrations.forEach(m => console.log(` - ${m.migration_name} (checksum: ${m.checksum?.slice(0, 10)}..., finished: ${m.finished_at})`));
  } catch (e) {
    console.log('No _prisma_migrations table found (DB was synchronized via db push or direct SQL script)');
  }

  // 7. Data inventory summary
  console.log('\n[7] CRITICAL ENTITY INVENTORY:');
  const [
    adminCount,
    vendorCount,
    customerCount,
    productCount,
    orderCount,
    notificationCount,
    unreadNotificationCount,
    readNotificationCount
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.vendor.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.notification.count(),
    prisma.notification.count({ where: { read: false } }),
    prisma.notification.count({ where: { read: true } })
  ]);

  console.log({
    AdminUsers: adminCount,
    Vendors: vendorCount,
    Customers: customerCount,
    Products: productCount,
    Orders: orderCount,
    TotalNotifications: notificationCount,
    UnreadNotifications: unreadNotificationCount,
    ReadNotifications: readNotificationCount
  });
}

deepAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
