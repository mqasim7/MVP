// src/app/admin/content/page.tsx
import { Metadata } from 'next';
import {ContentManagement} from '@/components/admin';

export const metadata: Metadata = {
  title: 'Content Management | Lululemon Admin',
  description: 'Manage content for Lululemon marketing campaigns',
};

export default function ContentManagementPage() {
  return <ContentManagement />;
}
