import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const DEFAULT_FAQS = [
  { id: '1', question: 'What areas do you serve in UAE?', answer: 'We deliver premium shisha services across all Emirates including Dubai (Marina, Downtown, Palm Jumeirah, Business Bay), Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.', category: 'Delivery', order: 1, enabled: true },
  { id: '2', question: 'How fast is on-demand sheesha delivery?', answer: 'In primary Dubai zones (Dubai Marina, JBR, Downtown, Business Bay, Palm Jumeirah), our delivery time is within 45 to 60 minutes from order confirmation.', category: 'Delivery', order: 2, enabled: true },
  { id: '3', question: 'Can I book a dedicated sheesha sommelier for a private party or yacht?', answer: 'Yes, our certified sheesha sommeliers provide white-glove table service, continuous coal replenishment, and custom flavor mixology for private villas, yachts, weddings, and corporate gatherings.', category: 'Rentals', order: 3, enabled: true },
  { id: '4', question: 'What is included with a SheeshaTonight rental package?', answer: 'Every rental includes a premium German/Russian pipe, fresh silicone hoses, hygienic disposable tips, odorless natural coconut coals, a portable electric coal burner, tongs, heat management devices, and your chosen premium tobacco flavors.', category: 'Rentals', order: 4, enabled: true },
  { id: '5', question: 'What is the age requirement to order?', answer: 'In full accordance with UAE federal laws, all customers must be 18 years of age or older. Valid Emirates ID or passport verification is required upon delivery.', category: 'Compliance', order: 5, enabled: true },
  { id: '6', question: 'What payment methods are supported?', answer: 'We accept major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Tabby, and Cash on Delivery.', category: 'Payments', order: 6, enabled: true },
];

export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const item = await prisma.cmsContent.findUnique({
      where: { key: 'faqs_list' },
    });

    const faqs = item?.value && Array.isArray(item.value) ? item.value : DEFAULT_FAQS;
    return successResponse(faqs, 'FAQs fetched successfully');
  } catch (error: any) {
    console.error('FAQs GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch FAQs', 500);
  }
});

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { faqs } = body;

    if (!Array.isArray(faqs)) {
      return errorResponse('FAQs array is required', 400);
    }

    const updated = await prisma.cmsContent.upsert({
      where: { key: 'faqs_list' },
      create: { key: 'faqs_list', value: faqs },
      update: { value: faqs },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_FAQS',
      resourceType: 'FAQS',
      afterState: { count: faqs.length },
    });

    return successResponse(updated.value, 'FAQs updated successfully in MySQL');
  } catch (error: any) {
    console.error('FAQs POST Error:', error);
    return errorResponse(error.message || 'Failed to update FAQs', 500);
  }
});

