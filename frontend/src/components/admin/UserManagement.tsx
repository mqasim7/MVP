"use client";

import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, MoreVertical,
  ShieldCheck, ShieldX, Mail, Calendar, CheckCircle, 
  XCircle, Eye, Lock,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock users data
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@lululemon.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-05-16T14:22:30',
      dateCreated: '2024-01-10',
      department: 'Marketing'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@lululemon.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2025-05-15T09:45:12',
      dateCreated: '2024-01-15',
      department: 'Content'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.johnson@lululemon.com',
      role: 'viewer',
      status: 'active',
      lastLogin: '2025-05-14T16:30:45',
      dateCreated: '2024-02-05',
      department: 'Design'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@lululemon.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2025-05-16T11:20:18',
      dateCreated: '2024-02-20',
      department: 'Marketing'
    },
    {
      id: 5,
      name: 'Michael Wilson',
      email: 'michael.wilson@lululemon.com',
      role: 'admin',
      status: 'inactive',
      lastLogin: '2025-04-30T10:15:22',
      dateCreated: '2024-01-05',
      department: 'IT'
    },
    {
      id: 6,
      name: 'Sarah Brown',
      email: 'sarah.brown@lululemon.com',
      role: 'viewer',
      status: 'pending',
      lastLogin: null,
      dateCreated: '2025-05-15',
      department: 'Sales'
    },
    {
      id: 7,
      name: 'David Miller',
      email: 'david.miller@lululemon.com',
      role: 'editor',
      status: 'inactive',
      lastLogin: '2025-03-24T14:50:10',
      dateCreated: '2024-03-10',
      department: 'Product'
    },
    {
      id: 8,
      name: 'Jennifer Taylor',
      email: 'jennifer.taylor@lululemon.com',
      role: 'viewer',
      status: 'active',
      lastLogin: '2025-05-17T08:30:00',
      dateCreated: '2024-04-15',
      department: 'Marketing'
    }
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString:any) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Today';
    } else if (diffDays <= 2) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString:any) => {
    if (!dateTimeString) return 'Never';
    
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // New user modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-base-content/70">Manage user accounts and permissions</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <span className="bg-base-200 px-2">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            className="select select-bordered" 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <select 
            className="select select-bordered" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-50">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.role === 'admin' ? 'badge-primary' :
                        user.role === 'editor' ? 'badge-secondary' :
                        'badge-ghost'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>{user.department}</td>
                    <td>
                      <div className="flex items-center">
                        {user.status === 'active' ? (
                          <CheckCircle size={16} className="mr-1 text-success" />
                        ) : user.status === 'inactive' ? (
                          <XCircle size={16} className="mr-1 text-error" />
                        ) : (
                          <Clock size={16} className="mr-1 text-warning" />
                        )}
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td>{formatDateTime(user.lastLogin)}</td>
                    <td>{formatDate(user.dateCreated)}</td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a><Edit size={14} className="mr-2" /> Edit User</a></li>
                          <li><a><Lock size={14} className="mr-2" /> Reset Password</a></li>
                          <li><a className={user.status === 'active' ? 'text-error' : 'text-success'}>
                            {user.status === 'active' ? (
                              <><XCircle size={14} className="mr-2" /> Deactivate</>
                            ) : (
                              <><CheckCircle size={14} className="mr-2" /> Activate</>
                            )}
                          </a></li>
                          <li><a className="text-error"><Trash2 size={14} className="mr-2" /> Delete</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={48} className="opacity-20" />
                      <h3 className="font-semibold">No users found</h3>
                      <p className="text-base-content/70">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box w-11/12 max-w-xl">
            <h3 className="font-bold text-lg">Add New User</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            
            <div className="py-4">
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input type="text" placeholder="e.g. John Doe" className="input input-bordered w-full" />
                  </div>
                  
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input type="email" placeholder="e.g. john.doe@example.com" className="input input-bordered w-full" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Role</span>
                    </label>
                    <select className="select select-bordered w-full">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Department</span>
                    </label>
                    <select className="select select-bordered w-full">
                      <option value="marketing">Marketing</option>
                      <option value="content">Content</option>
                      <option value="design">Design</option>
                      <option value="product">Product</option>
                      <option value="sales">Sales</option>
                      <option value="it">IT</option>
                    </select>
                  </div>
                </div>
                
                <div className="divider">Password</div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input type="checkbox" className="checkbox checkbox-primary mr-2" checked />
                    <span className="label-text">Send email invitation with password setup link</span>
                  </label>
                </div>
                
                <div className="form-control mt-4">
                  <label className="label cursor-pointer justify-start">
                    <input type="checkbox" className="checkbox checkbox-primary mr-2" />
                    <span className="label-text">Set password manually</span>
                  </label>
                </div>
                
                <div className="modal-action mt-6">
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Add User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}