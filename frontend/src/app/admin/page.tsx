// src/app/admin/page.tsx
import { Metadata } from 'next';
import ProtectedAdminDashboard from '@/components/admin/ProtectedAdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Lululemon',
  description: 'Admin dashboard for Lululemon marketing insights',
};

export default function AdminPage() {
  return <ProtectedAdminDashboard />;
}