import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Video, PieChart, FileText, Users, 
  Compass, LogOut, Settings
} from 'lucide-react';
import { SidebarProps } from '@/types/dashboard';
import { getStoredUser } from '@/lib/auth';

import { getInitials } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const user = getStoredUser();
  
  return (
    <div className="drawer-side">
      <label htmlFor="main-drawer" className="drawer-overlay" onClick={onClose}></label>
      <div className="menu p-4 w-80 h-full bg-grey bg-base-200 text-base-content">
        {/* Header */}
        <div className="flex items-center mb-6 pb-4 border-b border-base-300">
          <div className="bg-primary text-primary-content p-2 rounded mr-2">
            <span className="font-bold text-black">BI</span>
          </div>
          <span className="font-semibold text-xl"></span>
        </div>
        
        {/* Menu Items */}
        <ul className="menu menu-md">
          {/* <li>
            <Link 
              href="/dashboard" 
              className={pathname === '/dashboard' ? 'active' : ''}
            >
              <Home size={18} />
              Dashboard
            </Link>
          </li> */}
          <li>
            <Link 
              href="/dashboard/feed" 
              className={pathname === '/dashboard/feed' ? 'active' : ''}
            >
              <Video size={18} />
              Content Feed
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/insights" 
              className={pathname === '/dashboard/insights' ? 'active' : ''}
            >
              <PieChart size={18} />
              Insights
            </Link>
          </li>
          
        </ul>
        
        {user?.role === 'admin' && (
          <>
            <div className="divider">Admin</div>
            
            <ul className="menu menu-md">
              <li>
                <Link 
                  href="/admin/users" 
                  className={pathname === '/admin/users' ? 'active' : ''}
                >
                  <Users size={18} />
                  Manage Users
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/content" 
                  className={pathname === '/admin/content' ? 'active' : ''}
                >
                  <FileText size={18} />
                  Content Manager
                </Link>
              </li>
              
            </ul>
          </>
        )}
        
        {/* User Profile - Bottom */}
        <div className="mt-auto pt-4 border-t border-base-300">
          <div className="flex items-center">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>{user ? getInitials(user.name) : 'U'}</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs opacity-60">{user?.name || 'User'}</p>
            </div>
            <button 
              className="btn btn-ghost btn-circle ml-auto"
              onClick={() => logout()}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;