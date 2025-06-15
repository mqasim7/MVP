// frontend/src/app/admin/companies/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, Users, Activity, Globe, Edit, 
  ArrowLeft, Plus, MoreVertical, CheckCircle, XCircle,
  AlertCircle, Clock, Trash2,
  FileText,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { companyApi, contentApi, userApi } from '@/lib/api';
interface Company {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  user_count: number;
  created_at: string;
  stats?: {
    total_users: number;
    active_users: number;
    pending_users: number;
    total_content: number;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  last_login?: string;
  created_at: string;
}

interface ContentItem {
  id: number;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'gallery' | 'event';
  status: 'published' | 'draft' | 'scheduled' | 'review';
  created_at: string;
  author_name?: string;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  user_count: number;
  created_at: string;
  stats?: {
    total_users: number;
    active_users: number;
    pending_users: number;
    total_content: number;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  last_login?: string;
  created_at: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = parseInt(params.id as string);

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [companyResponse, usersResponse, contentResponse] = await Promise.all([
        companyApi.getById(companyId),
        companyApi.getUsers(companyId),
        contentApi.getAll()
      ]);

      setCompany(companyResponse);
      setUsers(usersResponse);
      setContentItems(contentResponse.filter((item:any) => item.company_id === companyId));
    } catch (error: any) {
      console.error('Error loading company data:', error);
      setError(error.response?.data?.message || 'Failed to load company data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const handleDeleteCompany = async () => {
    if (!company) return;
    
    if (!confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone and will affect all associated users.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await companyApi.delete(companyId);
      alert('Company deleted successfully!');
      router.push('/admin/companies');
    } catch (error: any) {
      console.error('Error deleting company:', error);
      alert(error.response?.data?.message || 'Failed to delete company. It may have existing users.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!company) return;
    
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    
    try {
      await companyApi.update(companyId, { status: newStatus });
      setCompany(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error: any) {
      console.error('Error updating company status:', error);
      alert(error.response?.data?.message || 'Failed to update company status');
    }
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Never';
    return new Date(dateTimeString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-error mb-4" />
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <div className="flex gap-2 justify-center">
            <button onClick={loadCompanyData} className="btn btn-primary">
              Retry
            </button>
            <Link href="/admin/companies" className="btn btn-ghost">
              Back to Companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
          <Link href="/admin/companies" className="btn btn-primary">
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const createUser = () => {
    router.push(`/admin/users/new?companyId=${company.id}`);
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/admin/companies" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            Back to Companies
          </Link>
          <div className="flex items-center">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-12 h-12 rounded-full mr-4 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`bg-primary text-primary-content p-3 rounded-full mr-4 ${company.logo_url ? 'hidden' : ''}`}>
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-2">
                <div className={`badge ${company.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                  {company.status}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <button 
            onClick={handleStatusToggle}
            className={`btn btn-outline ${company.status === 'active' ? 'btn-warning' : 'btn-success'}`}
          >
            <Activity size={16} />
            {company.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <Link href={`/admin/companies/${company.id}/edit`} className="btn btn-outline">
            <Edit size={16} />
            Edit Company
          </Link>
          <button 
            onClick={handleDeleteCompany}
            className="btn btn-error btn-outline"
            disabled={isDeleting}
          >
            {isDeleting && <span className="loading loading-spinner loading-sm mr-2"></span>}
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Company Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Users size={20} className="text-primary mr-2" />
              <div>
                <p className="text-sm opacity-70">Total Users</p>
                <p className="text-2xl font-bold">{company.stats?.total_users || users.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-success mr-2" />
              <div>
                <p className="text-sm opacity-70">Active Users</p>
                <p className="text-2xl font-bold">
                  {company.stats?.active_users || users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Clock size={20} className="text-warning mr-2" />
              <div>
                <p className="text-sm opacity-70">Pending Approval</p>
                <p className="text-2xl font-bold">
                  {company.stats?.pending_users || users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Activity size={20} className="text-info mr-2" />
              <div>
                <p className="text-sm opacity-70">Content Created</p>
                <p className="text-2xl font-bold">{company.stats?.total_content || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Company Information</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Industry</p>
                <p className="opacity-70">{company.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <div className={`badge ${company.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                  {company.status}
                </div>
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="opacity-70">{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
              {company.website && (
                <div>
                  <p className="font-medium">Website</p>
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    <Globe size={14} className="inline mr-1" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Company Users ({users.length})</h2>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={createUser}
                >
                  <Plus size={14} />
                  Add User
                </button>
              </div>
              
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div>
                              <div className="font-bold">{user.name}</div>
                              <div className="text-sm opacity-50">{user.email}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              user.role === 'admin' ? 'badge-primary' :
                              user.role === 'editor' ? 'badge-secondary' :
                              'badge-ghost'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.department || '-'}</td>
                          <td>
                            <div className={`badge ${
                              user.status === 'active' ? 'badge-success' : 
                              user.status === 'pending' ? 'badge-warning' : 'badge-ghost'
                            }`}>
                              {user.status}
                            </div>
                          </td>
                          <td className="text-sm">
                            {formatDateTime(user.last_login)}
                          </td>
                          <td>
                            <div className="dropdown dropdown-end">
                              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                                <MoreVertical size={16} />
                              </div>
                              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                  <Link href={`/admin/users/${user.id}/edit?companyId=${companyId}`}>
                                    <Edit size={14} className="mr-2" /> Edit User
                                  </Link>
                                </li>
                                <li><a className="text-error">Remove from Company</a></li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto opacity-20 mb-4" />
                  <h3 className="font-semibold mb-2">No users yet</h3>
                  <p className="text-base-content/70 mb-4">
                    Start by adding users to this company
                  </p>
                  <Link href={`/admin/users/new`} className="btn btn-primary">
                    <Plus size={16} className="mr-2" />
                    Add First User
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Company Content Overview Section --- */}
      <div className="card bg-base-100 shadow-xl mt-10">
        <div className="card-body">
          <h2 className="card-title">Company Content Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm opacity-70">Total Content</p>
              <p className="text-xl font-bold">{contentItems.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-70">Published</p>
              <p className="text-xl font-bold">{contentItems.filter(c => c.status === 'published').length}</p>
            </div>
            <div>
              <p className="text-sm opacity-70">Drafts</p>
              <p className="text-xl font-bold">{contentItems.filter(c => c.status === 'draft').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Company Content List Section --- */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
        <div className="flex flex-col lg:flex-row justify-between mb-8">
        <div>
          <h2 className="card-title mb-4">Company Content List</h2>
        </div>
        <Link href={`/admin/content/new?companyId=${companyId}`} className="btn btn-primary mt-4 lg:mt-0">
          <Plus size={16} /> Add New Content
        </Link>
      </div>
          {contentItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td className="capitalize">{item.type}</td>
                      <td>
                        <span className={`badge ${
                          item.status === 'published' ? 'badge-success' :
                          item.status === 'draft' ? 'badge-warning' :
                          item.status === 'scheduled' ? 'badge-info' :
                          'badge-ghost'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.author_name || 'Unknown'}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <Link href={`/admin/content/${item.id}?companyId=${companyId}`} className="btn btn-sm btn-ghost">
                          <Eye size={14} className="mr-1" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto opacity-20 mb-4" />
              <h3 className="font-semibold mb-2">No content available</h3>
              <p className="text-base-content/70">This company hasn't created any content yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}