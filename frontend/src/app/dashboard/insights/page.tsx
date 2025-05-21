import React from 'react';
import { Metadata } from 'next';
import InsightsGrid from '@/components/insights/InsightsGrid';

export const metadata: Metadata = {
  title: 'Insights | Lululemon Dashboard',
  description: 'Marketing insights and analytics for Lululemon',
};

export default function InsightsPage() {
  return <InsightsGrid />;
}