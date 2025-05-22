
// frontend/src/app/admin/companies/page.tsx
import { Metadata } from 'next';
import { CompanyManagement } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Company Management | Lululemon Admin',
  description: 'Manage companies and their access to the platform',
};

export default function CompanyManagementPage() {
  return <CompanyManagement />;
}
