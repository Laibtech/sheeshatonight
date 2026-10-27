import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET - Fetch user's orders
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

    // Fetch orders
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        vendor: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            issuedAt: true,
            subtotal: true,
            tax: true,
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      vendor: order.vendor.name,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.title,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      invoice: order.invoice
        ? {
            id: order.invoice.id,
            invoiceNumber: order.invoice.invoiceNumber,
            issuedAt: order.invoice.issuedAt.toISOString(),
          }
        : undefined,
      customer: {
        name: user.name || 'Valued Customer',
        email: user.email,
        phone: user.phone || '',
      },
      shippingAddress: (order as any).shippingAddress || '',
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
});

// POST - Create a new order directly
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items, notes, rentalStartDate, rentalEndDate } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order items required' }, { status: 400 });
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
      include: { vendor: true },
    });

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: 'Products not found or unavailable' }, { status: 404 });
    }

    const vendorId = products[0]!.vendorId;
    let totalAmount = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const item of items) {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p) continue;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (p.stock < qty) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for "${p.title}". Available: ${p.stock}, Requested: ${qty}`,
        }, { status: 400 });
      }
      const price = Number(p.price);
      totalAmount += price * qty;
      orderItemsData.push({
        productId: p.id,
        quantity: qty,
        price,
      });
    }

    // Generate unique collision-safe order number
    const count = await prisma.order.count();
    let orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    let exists = await prisma.order.findUnique({ where: { orderNumber } });
    let counter = count + 1;
    while (exists) {
      counter++;
      orderNumber = `ORD-${new Date().getFullYear()}-${String(counter).padStart(3, '0')}`;
      exists = await prisma.order.findUnique({ where: { orderNumber } });
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          vendorId,
          totalAmount,
          currency: 'AED',
          status: 'PREPARING',
          rentalStartDate: rentalStartDate ? new Date(rentalStartDate) : null,
          rentalEndDate: rentalEndDate ? new Date(rentalEndDate) : null,
          notes: notes || null,
        },
      });

      for (const item of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const tax = totalAmount * 0.05;
      await tx.invoice.create({
        data: {
          orderId: createdOrder.id,
          invoiceNumber: `INV-${orderNumber}`,
          subtotal: totalAmount,
          tax,
          total: totalAmount + tax,
          issuedAt: new Date(),
        },
      });

      await tx.orderTracking.create({
        data: {
          orderId: createdOrder.id,
          status: 'PREPARING',
          events: [
            {
              status: 'PREPARING',
              timestamp: new Date().toISOString(),
              message: 'Order received and being prepared by vendor',
            },
          ],
        },
      });

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create order' }, { status: 500 });
  }
});
