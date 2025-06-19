'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Bell, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getStoredUser } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const pathname = usePathname();
  const {logout} = useAuth();
  const user = getStoredUser();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);
  
  return (
    <div className="drawer lg:drawer-open">
      <input 
        id="main-drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={sidebarOpen} 
        onChange={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="drawer-content flex flex-col min-h-screen">
        <header className="navbar bg-base-100 shadow-sm sticky top-0 z-10">
          <div className="flex-none lg:hidden">
            <label htmlFor="main-drawer" className="btn btn-square btn-ghost">
              <Menu size={20} />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{ user!.company_name}</h1>
          </div>
          <div className="flex-none gap-2">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle p-0">
                <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                  <span>{ user!.name ? getInitials(user!.name) : 'U' }</span>
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-50 p-2 text-black shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li><a onClick={() => logout()}>Logout</a></li>
              </ul>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 overflow-y-auto pb-16 lg:pb-4" >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;