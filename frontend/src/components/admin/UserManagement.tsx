// frontend/src/components/admin/UserManagement.tsx (updated)
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, MoreVertical,
  ShieldCheck, ShieldX, Mail, Calendar, CheckCircle, 
  XCircle, Eye, Lock, Clock, Users, Building2
} from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  department?: string;
  company_id?: number;
  company_name?: string;
  last_login?: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer',
    department: '',
    company_id: '',
    status: 'pending' as 'active' | 'inactive' | 'pending',
    password: '',
    sendInvite: true
  });
  
  // Mock data
  const mockCompanies: Company[] = [
    { id: 1, name: 'Lululemon', status: 'active' },
    { id: 2, name: 'Nike Marketing', status: 'active' },
    { id: 3, name: 'Adidas Digital', status: 'active' },
    { id: 4, name: 'Under Armour', status: 'inactive' },
  ];

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@lululemon.com',
      role: 'admin',
      status: 'active',
      department: 'IT',
      company_id: 1,
      company_name: 'Lululemon',
      last_login: '2025-05-16T14:22:30',
      created_at: '2024-01-10'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@nike.com',
      role: 'editor',
      status: 'active',
      department: 'Marketing',
      company_id: 2,
      company_name: 'Nike Marketing',
      last_login: '2025-05-15T09:45:12',
      created_at: '2024-01-15'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@nike.com',
      role: 'viewer',
      status: 'pending',
      department: 'Content',
      company_id: 2,
      company_name: 'Nike Marketing',
      created_at: '2025-05-15'
    },
    {
      id: 4,
      name: 'Michael Chen',
      email: 'michael.chen@adidas.com',
      role: 'viewer',
      status: 'active',
      department: 'Design',
      company_id: 3,
      company_name: 'Adidas Digital',
      last_login: '2025-05-14T16:30:45',
      created_at: '2024-02-05'
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setCompanies(mockCompanies);
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || user.company_id?.toString() === companyFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesCompany;
  });

  const handleModalOpen = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        company_id: user.company_id?.toString() || '',
        status: user.status,
        password: '',
        sendInvite: false
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        department: '',
        company_id: '',
        status: 'pending',
        password: '',
        sendInvite: true
      });
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const company = companies.find(c => c.id.toString() === formData.company_id);
      
      if (editingUser) {
        // Update user
        const updatedUser: User = {
          ...editingUser,
          ...formData,
          company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
          company_name: company?.name,
          role: formData.role,
          status: formData.status
        };
        
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
        // Create user
        const newUser: User = {
          id: Date.now(),
          ...formData,
          company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
          company_name: company?.name,
          role: formData.role,
          status: formData.status,
          created_at: new Date().toISOString().split('T')[0]
        };
        
        setUsers(prev => [newUser, ...prev]);
      }
      
      handleModalClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus as any } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Never';
    
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-base-content/70">Manage user accounts and permissions across companies</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button className="btn btn-primary" onClick={() => handleModalOpen()}>
            <Plus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{users.length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Active Users</div>
          <div className="stat-value text-success">
            {users.filter(u => u.status === 'active').length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Pending Approval</div>
          <div className="stat-value text-warning">
            {users.filter(u => u.status === 'pending').length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Companies</div>
          <div className="stat-value">
            {new Set(users.map(u => u.company_id).filter(Boolean)).size}
          </div>
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
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="all">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id.toString()}>{company.name}</option>
            ))}
          </select>
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
                <th>Company</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
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
                      {user.company_name ? (
                        <div className="flex items-center">
                          <Building2 size={14} className="mr-1 opacity-50" />
                          <span>{user.company_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No company</span>
                      )}
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
                    <td>{user.department || '-'}</td>
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
                    <td className="text-sm">{formatDateTime(user.last_login)}</td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a onClick={() => handleModalOpen(user)}><Edit size={14} className="mr-2" /> Edit User</a></li>
                          <li><a><Lock size={14} className="mr-2" /> Reset Password</a></li>
                          <li><a onClick={() => handleStatusToggle(user.id, user.status)} className={user.status === 'active' ? 'text-error' : 'text-success'}>
                            {user.status === 'active' ? (
                              <><XCircle size={14} className="mr-2" /> Deactivate</>
                            ) : (
                              <><CheckCircle size={14} className="mr-2" /> Activate</>
                            )}
                          </a></li>
                          <li><a className="text-error" onClick={() => handleDelete(user.id)}><Trash2 size={14} className="mr-2" /> Delete</a></li>
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

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleModalClose}
            >
              ✕
            </button>
            
            <form onSubmit={handleSubmit} className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Full Name *</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    className="input input-bordered w-full" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Email *</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="john.doe@company.com" 
                    className="input input-bordered w-full" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Company *</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.company_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                    required
                  >
                    <option value="">Select a company</option>
                    {companies.filter(c => c.status === 'active').map(company => (
                      <option key={company.id} value={company.id.toString()}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Role *</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Department</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marketing" 
                    className="input input-bordered w-full" 
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              {!editingUser && (
                <>
                  <div className="divider">Account Setup</div>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-primary mr-2" 
                        checked={formData.sendInvite}
                        onChange={(e) => setFormData(prev => ({ ...prev, sendInvite: e.target.checked }))}
                      />
                      <span className="label-text">Send email invitation with password setup link</span>
                    </label>
                  </div>
                  
                  {!formData.sendInvite && (
                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text">Temporary Password</span>
                      </label>
                      <input 
                        type="password" 
                        placeholder="Leave blank to generate automatically" 
                        className="input input-bordered w-full" 
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="modal-action mt-6">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}