import type { Order, BookingRequest, VendorKYC, MetricCard } from './types';

/**
 * @deprecated These are mock constants for UI development only
 * Real data should come from the database via API calls
 * 
 * For real orders: Use /api/orders
 * For real vendor KYC: Use /api/admin/vendors
 * For real metrics: Use /api/admin/stats
 */

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-001',
    venue: 'Noir Cloud Studio',
    status: 'Preparing',
    progress: 40,
    total: 'AED 794',
    rentalDate: 'Tonight',
    estimatedDelivery: '9:30 PM',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-002',
    venue: 'The Ember Room',
    status: 'Out for Delivery',
    progress: 72,
    total: 'AED 1,250',
    estimatedDelivery: '10:15 PM',
  },
];

export const MOCK_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 'br-1',
    customerName: 'Ahmed Al-Mansouri',
    productName: 'Premium Turkish Blend (500g)',
    rentalDate: '2026-05-24',
    quantity: 3,
    status: 'PENDING',
  },
  {
    id: 'br-2',
    customerName: 'Fatima Al-Khaleej',
    productName: 'Deluxe Sheesha Pipe Setup',
    rentalDate: '2026-05-25',
    quantity: 2,
    status: 'PENDING',
  },
];

export const MOCK_KYC_QUEUE: VendorKYC[] = [
  {
    vendorId: 'v-1',
    vendorName: 'Bespoke Sheesha Co.',
    license: 'https://s3.../license-001.pdf',
    identity: 'Verified',
    status: 'PENDING',
    submittedDate: '2026-05-20',
  },
  {
    vendorId: 'v-2',
    vendorName: 'The Ember Room',
    license: 'https://s3.../license-002.pdf',
    identity: 'Pending Verification',
    status: 'PENDING',
    submittedDate: '2026-05-19',
  },
];

export const ADMIN_METRICS: MetricCard[] = [
  { label: 'Platform GMV', value: 'AED 2.4M', trend: '+5%' },
  { label: 'Active Vendors', value: '342', trend: '+12%' },
  { label: 'Pending KYC', value: '23', icon: 'AlertTriangle' },
  { label: 'Avg Commission', value: '8.5%', icon: 'Coins' },
];
