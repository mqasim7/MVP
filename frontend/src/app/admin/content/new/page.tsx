// src/app/admin/content/new/page.tsx
import { Metadata } from 'next';
import {ContentCreation} from '@/components/admin';

export const metadata: Metadata = {
  title: 'New Content | Lululemon Admin',
  description: 'Create new content for Lululemon marketing campaigns',
};

export default function ContentCreationPage() {
  // This component would need to be implemented
  return <ContentCreation />;
}