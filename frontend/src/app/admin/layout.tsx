'use client';

import { AdminLayout } from '@/components/admin';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}