"use client";

import React, { useState } from 'react';
import { Settings, Users, FileText, Grid, BarChart2, Shield, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Admin layout component
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    <div className="drawer lg:drawer-open">
      <input 
        id="admin-drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={sidebarOpen} 
        onChange={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label htmlFor="admin-drawer" className="drawer-overlay" onClick={() => setSidebarOpen(false)}></label>
        <div className="menu p-4 w-80 h-full bg-base-200 text-base-content">
          {/* Admin Header */}
          <div className="flex items-center mb-6 pb-4 border-b border-base-300">
            <div className="bg-primary text-primary-content p-2 rounded mr-2">
              <Shield size={20} />
            </div>
            <span className="font-semibold text-xl">Admin Dashboard</span>
          </div>
          
          {/* Admin Menu */}
          <ul className="menu menu-md rounded-box">
            <li>
              <Link 
                href="/admin" 
                className={pathname === '/admin' ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <Grid size={18} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/content" 
                className={pathname === '/admin/content' ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <FileText size={18} />
                Content Management
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/personas" 
                className={pathname === '/admin/personas' ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <Users size={18} />
                Persona Management
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className={pathname === '/admin/users' ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <Users size={18} />
                User Management
              </Link>
            </li>
            
          </ul>
          
          <div className="mt-auto">
            <Link 
              href="/dashboard" 
              className="btn btn-outline w-full"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="drawer-content flex flex-col">
        <header className="navbar bg-base-100 shadow-sm sticky top-0 z-10">
          <div className="flex-none lg:hidden">
            <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Lululemon Admin</h1>
          </div>
          <div className="flex-none gap-2">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span>A</span>
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li><a>Profile</a></li>
                <li><a>Settings</a></li>
                <li><a>Logout</a></li>
              </ul>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 overflow-y-auto pb-16 lg:pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}