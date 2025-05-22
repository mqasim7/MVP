// frontend/src/app/admin/insights/page.tsx
import { Metadata } from 'next';
import { InsightsManagement } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Insights Management | Lululemon Admin',
  description: 'Create and manage marketing insights and analytics',
};

export default function InsightsManagementPage() {
  return <InsightsManagement />;
}