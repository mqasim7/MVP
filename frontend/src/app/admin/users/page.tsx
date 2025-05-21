import { UserManagement } from '@/components/admin';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | Lululemon Admin',
  description: 'Manage users for Lululemon dashboard',
};

export default function UserManagementPage() {
  // This component would need to be implemented
  return <UserManagement />;
}