// src/app/admin/personas/page.tsx
import { Metadata } from 'next';
import {PersonaManagement} from '@/components/admin';

export const metadata: Metadata = {
  title: 'Persona Management | Lululemon Admin',
  description: 'Manage audience personas for Lululemon marketing',
};

export default function PersonaManagementPage() {
  return <PersonaManagement />;
}