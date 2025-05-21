import React from 'react';
import { Metadata } from 'next';
import FeedContainer from '@/components/feed/FeedContainer';

export const metadata: Metadata = {
  title: 'Content Feed | Lululemon Dashboard',
  description: 'Interactive content feed for Lululemon marketing insights',
};

export default function FeedPage() {
  return <FeedContainer />;
}