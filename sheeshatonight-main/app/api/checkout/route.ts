import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { notifyVendorNewOrder } from '@/lib/notifications';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/email';
import type { Cart, Product, Vendor } from '@prisma/client';

type CartWithProductAndVendor = Cart & {
  product: Product & {
    vendor: Vendor;
  };
};

// POST - Create order from cart with server-side multi-vendor splitting & platform commission
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { shippingAddress, billingAddress, paymentMethod, notes } = body;

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipping or payment fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Server-side legal age requirement for UAE tobacco/sheesha marketplace (18+)
    if (user.dob) {
      const ageInYears = (Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageInYears < 18) {
        return NextResponse.json(
          { success: false, error: 'You must be at least 18 years of age to order sheesha or tobacco products.' },
          { status: 403 }
        );
      }
    }

    // Fetch cart items with product and vendor details
    const cartItems = (await prisma.cart.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
      },
    })) as any as CartWithProductAndVendor[];

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate all products are active and have sufficient stock
    for (const item of cartItems) {
      if (!item.product.isActive || item.product.deletedAt) {
        return NextResponse.json(
          { success: false, error: `Product "${item.product.title}" is no longer available` },
          { status: 400 }
        );
      }
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for "${item.product.title}". Only ${item.product.stock} units left.` },
          { status: 400 }
        );
      }
    }

    // Fetch active global platform commission setting from MySQL
    let platformSetting = await prisma.platformSetting.findUnique({
      where: { key: 'platform_commission' },
    });

    if (!platformSetting) {
      platformSetting = {
        id: 'default',
        key: 'platform_commission',
        commissionType: 'PERCENTAGE',
        commissionValue: 10.00 as any,
        fixedFee: 0.00 as any,
        description: 'Global marketplace default commission',
        updatedAt: new Date(),
      };
    }

    // Group cart items strictly by vendor
    const itemsByVendor = cartItems.reduce((acc, item) => {
      const vendorId = item.product.vendorId;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: item.product.vendor,
          items: [],
        };
      }
      acc[vendorId].items.push(item);
      return acc;
    }, {} as Record<string, { vendor: Vendor; items: typeof cartItems }>);

    // Create vendor-specific orders inside an atomic transaction
    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const [vendorId, { vendor, items }] of Object.entries(itemsByVendor)) {
        // Calculate subtotal from trusted database product prices
        const subtotal = items.reduce((sum, item) => {
          return sum + Number(item.product.price) * item.quantity;
        }, 0);

        const shippingFee = 0; // Complimentary shipping
        const discountAmount = 0;
        const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

        // Determine applicable commission rate (vendor override takes priority over global setting)
        let appliedCommissionRate = Number(platformSetting?.commissionValue || 10);
        if (vendor.commissionRate !== null && vendor.commissionRate !== undefined) {
          appliedCommissionRate = Number(vendor.commissionRate);
        }

        let platformFee = 0;
        if (platformSetting?.commissionType === 'FIXED') {
          platformFee = Math.min(totalAmount, Number(platformSetting.fixedFee || 0));
        } else {
          // Percentage commission rounded to 2 decimal places
          platformFee = Math.round((subtotal * appliedCommissionRate) / 100 * 100) / 100;
        }

        // Vendor Net = Total Amount - Platform Fee
        const vendorNet = Math.max(0, Math.round((totalAmount - platformFee) * 100) / 100);

        // Generate unique order number (e.g. ORD-2026-008)
        const orderCount = await tx.order.count();
        let orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;
        let exists = await tx.order.findUnique({ where: { orderNumber } });
        let counter = orderCount + 1;
        while (exists) {
          counter++;
          orderNumber = `ORD-${new Date().getFullYear()}-${String(counter).padStart(3, '0')}`;
          exists = await tx.order.findUnique({ where: { orderNumber } });
        }

        // Create the vendor's isolated order record with full financial breakdown
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            vendorId,
            totalAmount,
            subtotal,
            shippingFee,
            discountAmount,
            commissionRate: appliedCommissionRate,
            platformFee,
            vendorNet,
            payoutStatus: 'PENDING',
            currency: items[0]?.product?.currency || 'AED',
            status: 'PREPARING',
            notes: notes || null,
          },
        });

        // Create order items & decrement stock atomically
        for (const item of items) {
          const currentProd = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true, title: true },
          });

          if (!currentProd || currentProd.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${currentProd?.title || item.product.title}". Only ${currentProd?.stock ?? 0} available.`);
          }

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Create official Invoice
        const tax = Math.round(totalAmount * 0.05 * 100) / 100; // 5% UAE VAT
        const invoiceTotal = totalAmount + tax;

        await tx.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber: `INV-${orderNumber}`,
            subtotal: totalAmount,
            tax,
            total: invoiceTotal,
            issuedAt: new Date(),
          },
        });

        orders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          vendor: vendor.name,
          vendorId: vendor.id,
          subtotal,
          totalAmount,
          platformFee,
          vendorNet,
          commissionRate: appliedCommissionRate,
          currency: order.currency,
        });

        // Notify vendor about new order
        try {
          await notifyVendorNewOrder(order.id);
        } catch (err) {
          console.error(`Vendor notification error for order ${order.id}:`, err);
        }

        // Dispatch email confirmation to customer
        try {
          if (user.email) {
            await sendOrderConfirmationEmail({
              to: user.email,
              customerName: user.name || 'Valued Customer',
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount.toString(),
              currency: order.currency,
              vendorName: vendor.name,
            });
          }
        } catch (emailErr) {
          console.error(`Order confirmation email error for order ${order.id}:`, emailErr);
        }

        // Dispatch alert notification to configured admin email
        try {
          await sendAdminNewOrderEmail({
            orderNumber: order.orderNumber,
            customerName: user.name || 'Valued Customer',
            customerEmail: user.email || 'customer@sheeshatonight.com',
            totalAmount: order.totalAmount.toString(),
            currency: order.currency,
            vendorName: vendor.name,
            itemsCount: items.length,
          });
        } catch (adminEmailErr) {
          console.error(`Admin order notification email error for order ${order.id}:`, adminEmailErr);
        }
      }

      // Clear user's cart in DB
      await tx.cart.deleteMany({
        where: { userId: user.id },
      });

      return orders;
    });

    return NextResponse.json({
      success: true,
      message: 'Orders created successfully with platform commission calculated server-side',
      data: {
        orders: createdOrders,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error during checkout:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
});
