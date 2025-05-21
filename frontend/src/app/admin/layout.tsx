import {AdminLayout} from '@/components/admin';

export const metadata = {
  title: 'Admin | Lululemon Dashboard',
  description: 'Admin dashboard for Lululemon marketing insights',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}


// Note: These files should be placed in their respective directories in the src/app folder structure.
// You will also need to make sure the components are created in the src/components/admin/ directory:
// - src/components/admin/AdminLayout.tsx
// - src/components/admin/AdminDashboard.tsx
// - src/components/admin/ContentManagement.tsx
// - src/components/admin/PersonaManagement.tsx
// - src/components/admin/ContentCreation.tsx (to be implemented)
// - src/components/admin/UserManagement.tsx (to be implemented)

