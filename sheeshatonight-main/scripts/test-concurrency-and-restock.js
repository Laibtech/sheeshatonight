const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PORT = parseInt(process.env.PORT || '3001', 10);

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const headers = { 
      Origin: `http://localhost:${PORT}`,
      ...options.headers 
    };
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: options.path,
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(raw);
          } catch (e) {
            json = { raw };
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runConcurrencyAndRestockTests() {
  console.log('=== RUNNING CONCURRENCY, STOCK INTEGRITY & RESTOCK REGRESSION SUITE ===\n');

  try {
    // 1. Customer Authentication
    console.log('1. Authenticating test customer...');
    const loginRes = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'customer@sheeshatonight.com', password: 'customer123' }
    );

    if (loginRes.statusCode !== 200) {
      throw new Error(`Customer login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.token;
    const customerUser = loginRes.body.user;
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      Cookie: loginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '',
    };
    console.log(`✅ Customer authenticated (User ID: ${customerUser.id}).\n`);

    // 2. Select a target product
    const product = await prisma.product.findFirst({
      where: {
        isActive: true,
        stock: { gt: 5 },
      },
      include: { vendor: true },
    });

    if (!product) {
      throw new Error('No active product found with stock > 5 for test');
    }

    const initialStock = product.stock;
    console.log(`Target product selected: "${product.title}" (ID: ${product.id})`);
    console.log(`Initial stock level: ${initialStock} units (Vendor: ${product.vendor?.storeName || product.vendorId})\n`);

    const standardAddress = {
      firstName: 'Ahmed',
      lastName: 'Al Maktoum',
      email: 'customer@sheeshatonight.com',
      phone: '+971501234567',
      street: 'Sheikh Zayed Road, Building 45',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '00000',
      country: 'UAE',
    };

    // 3. Test Overselling Protection (Concurrency guard)
    console.log('2. Testing Oversell / Stock Limit Protection in Cart Checkout...');
    // Clean customer cart
    await prisma.cart.deleteMany({ where: { userId: customerUser.id } });
    
    // Put excessive quantity into cart directly
    const oversellQty = initialStock + 50;
    await prisma.cart.create({
      data: {
        userId: customerUser.id,
        productId: product.id,
        quantity: oversellQty,
      },
    });

    const oversellRes = await request(
      { path: '/api/checkout', method: 'POST', headers: authHeaders },
      {
        shippingAddress: standardAddress,
        billingAddress: standardAddress,
        paymentMethod: 'COD',
      }
    );

    if (oversellRes.statusCode === 400 && (oversellRes.body.error || '').toLowerCase().includes('stock')) {
      console.log(`✅ Oversell request rejected with HTTP 400 as expected: "${oversellRes.body.error}"\n`);
    } else {
      throw new Error(`Expected HTTP 400 with stock error, got HTTP ${oversellRes.statusCode}: ${JSON.stringify(oversellRes.body)}`);
    }

    // 4. Test Valid Order Placement & Stock Decrement
    console.log('3. Placing valid order for 2 units and verifying transactional stock decrement...');
    await prisma.cart.deleteMany({ where: { userId: customerUser.id } });
    const orderQty = 2;
    await prisma.cart.create({
      data: {
        userId: customerUser.id,
        productId: product.id,
        quantity: orderQty,
      },
    });

    const checkoutRes = await request(
      { path: '/api/checkout', method: 'POST', headers: authHeaders },
      {
        shippingAddress: standardAddress,
        billingAddress: standardAddress,
        paymentMethod: 'COD',
      }
    );

    const orders = checkoutRes.body.data?.orders || checkoutRes.body.orders || [];
    if ((checkoutRes.statusCode !== 200 && checkoutRes.statusCode !== 201) || orders.length === 0) {
      throw new Error(`Order placement failed: HTTP ${checkoutRes.statusCode} - ${JSON.stringify(checkoutRes.body)}`);
    }

    const createdOrder = orders[0];
    console.log(`✅ Order placed successfully: ID ${createdOrder.id}, Total: AED ${createdOrder.totalAmount}`);

    // Verify stock decremented in database
    const postOrderProduct = await prisma.product.findUnique({ where: { id: product.id } });
    const expectedStockAfterOrder = initialStock - orderQty;
    if (postOrderProduct.stock !== expectedStockAfterOrder) {
      throw new Error(`Stock mismatch! Expected ${expectedStockAfterOrder}, found ${postOrderProduct.stock}`);
    }
    console.log(`✅ Stock decremented accurately: ${initialStock} -> ${postOrderProduct.stock} (-${orderQty} units)\n`);

    // 5. Test Commission Calculation Integrity
    console.log('4. Verifying server-side commission calculation on created order...');
    const orderInDb = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      include: { items: true },
    });

    const platformSetting = await prisma.platformSetting.findUnique({ where: { key: 'platform_commission' } });
    const subtotal = Number(orderInDb.subtotal);
    const commissionRate = Number(orderInDb.commissionRate);
    let expectedFee = 0;
    if (platformSetting?.commissionType === 'FIXED') {
      expectedFee = Math.min(subtotal, Number(platformSetting.fixedFee || 0));
      console.log(`   Commission Type: FIXED (Fee: AED ${platformSetting.fixedFee})`);
    } else {
      expectedFee = Math.round((subtotal * commissionRate) / 100 * 100) / 100;
      console.log(`   Commission Type: PERCENTAGE (Rate: ${commissionRate}%)`);
    }
    const actualFee = Number(orderInDb.platformFee);

    console.log(`   Subtotal: AED ${subtotal.toFixed(2)}, Expected Fee: AED ${expectedFee.toFixed(2)}, Actual Fee: AED ${actualFee.toFixed(2)}`);
    if (Math.abs(actualFee - expectedFee) > 0.01) {
      throw new Error(`Commission calculation mismatch! Expected ${expectedFee}, got ${actualFee}`);
    }
    console.log(`✅ Platform fee calculation verified server-side (AED ${actualFee.toFixed(2)}).\n`);

    // 6. Test Order Cancellation & Automatic Restock
    console.log('5. Cancelling order via Admin and verifying automatic stock replenishment...');
    const adminLoginRes = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'admin@sheeshatonight.com', password: 'admin123' }
    );
    if (adminLoginRes.statusCode !== 200) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.body)}`);
    }
    const adminHeaders = {
      Authorization: `Bearer ${adminLoginRes.body.token}`,
      Cookie: adminLoginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '',
    };

    const cancelRes = await request(
      { path: `/api/orders/${createdOrder.id}`, method: 'POST', headers: adminHeaders },
      { action: 'cancel', reason: 'Automated stock regression test cancellation' }
    );

    if (cancelRes.statusCode !== 200) {
      throw new Error(`Order cancellation failed: HTTP ${cancelRes.statusCode} - ${JSON.stringify(cancelRes.body)}`);
    }
    console.log(`✅ Order cancelled successfully (Status: ${cancelRes.body.data?.status || 'CANCELLED'})`);

    // Verify stock is fully restored in database
    const restoredProduct = await prisma.product.findUnique({ where: { id: product.id } });
    if (restoredProduct.stock !== initialStock) {
      throw new Error(`Restock failed! Expected ${initialStock}, found ${restoredProduct.stock}`);
    }
    console.log(`✅ Stock restored accurately to original level: ${restoredProduct.stock} units (+${orderQty} units restocked)\n`);

    // 7. Verify Order Tracking Audit Trail
    console.log('6. Verifying audit trail in OrderTracking...');
    const trackings = await prisma.orderTracking.findMany({
      where: { orderId: createdOrder.id },
      orderBy: { lastUpdated: 'asc' },
    });
    console.log(`   Order tracking events recorded: ${trackings.length}`);
    trackings.forEach(t => console.log(`   - [${t.status}] (Updated: ${t.lastUpdated})`));

    const finalOrder = await prisma.order.findUnique({ where: { id: createdOrder.id } });
    if (finalOrder.status !== 'CANCELLED') {
      throw new Error(`Expected order status CANCELLED, got ${finalOrder.status}`);
    }
    console.log(`✅ Order status verified as CANCELLED in database.\n`);

    console.log('================================================================');
    console.log('🎉 ALL CONCURRENCY, STOCK INTEGRITY & RESTOCK REGRESSIONS PASSED!');
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ REGRESSION TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runConcurrencyAndRestockTests();
