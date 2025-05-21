// src/components/admin/ProtectedAdminDashboard.tsx
'use client';

import withAuth from '@/components/auth/withAuth';
import { AdminDashboard } from '@/components/admin';

// Apply the HOC in a client component context
export default withAuth(AdminDashboard, 'admin');