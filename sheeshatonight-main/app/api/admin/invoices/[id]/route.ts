import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

/**
 * GET /api/admin/invoices/[id]
 * Fetch single invoice by invoice ID or invoiceNumber or orderId (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {

      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { id },
            { invoiceNumber: id },
            { orderId: id },
          ],
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  addresses: true,
                },
              },
              vendor: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  phone: true,
                  location: true,
                },
              },
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      sku: true,
                      price: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!invoice) {
        return errorResponse('Invoice not found', 404);
      }

      const formatted = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        orderNumber: invoice.order.orderNumber,
        issuedAt: invoice.issuedAt,
        pdfUrl: invoice.pdfUrl,
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.tax),
        total: Number(invoice.total),
        order: {
          ...invoice.order,
          totalAmount: Number(invoice.order.totalAmount),
          items: invoice.order.items.map((it) => ({
            ...it,
            price: Number(it.price),
            product: {
              ...it.product,
              price: Number(it.product.price),
            },
          })),
        },
      };

      return successResponse(formatted, 'Invoice retrieved successfully', 200);
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      return errorResponse('Failed to fetch invoice', 500);
    }
  })(request);
}
