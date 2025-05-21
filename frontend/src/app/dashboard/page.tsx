import { Metadata } from 'next';
import DashboardHome from '@/components/dashboard/DashboardHome';

export const metadata: Metadata = {
  title: 'Dashboard | Lululemon Marketing Insights',
  description: 'Content performance analytics for Lululemon marketing team',
};

export default function DashboardPage() {
  return <DashboardHome />;
}