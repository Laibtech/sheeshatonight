'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CustomerPortalLayout } from '@/components/CustomerPortalLayout';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <CustomerPortalLayout>
        {children}
      </CustomerPortalLayout>
    </ProtectedRoute>
  );
}
