// frontend/src/app/admin/users/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, User, Save, Trash2, Mail, Building2, UserCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { userApi, companyApi } from '@/lib/api';

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

interface Company {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

interface FormData {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  department: string;
  company_id: string;
  status: 'active' | 'inactive' | 'pending';
}

interface FormErrors {
  [key: string]: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'viewer',
    department: '',
    company_id: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');  

  // Load user and companies data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load user and companies in parallel
        const [userResponse, companiesResponse] = await Promise.all([
          userApi.getById(userId),
          companyApi.getAll()
        ]);
        
        setUser(userResponse);
        setCompanies(companiesResponse);
        
        // Populate form with user data
        setFormData({
          name: userResponse.name || '',
          email: userResponse.email || '',
          role: userResponse.role || 'viewer',
          department: userResponse.department || '',
          company_id: userResponse.company_id?.toString() || '',
          status: userResponse.status || 'pending'
        });
      } catch (error: any) {
        console.error('Error loading data:', error);
        if (error.response?.status === 404) {
          setError('User not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load user data');
        }
      } finally {
        setIsLoading(false);
        setLoadingCompanies(false);
      }
    };

    loadData();
  }, [userId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Please select a company';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await userApi.update(userId, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        department: formData.department.trim() || undefined,
        company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
        status: formData.status
      });
      
      alert('User updated successfully!');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || 'Failed to update user. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await userApi.delete(userId);
      alert('User deleted successfully!');
      if(companyId) {
        // Redirect to company page
        router.push(`/admin/companies/${companyId}`)
      } else {
        // Redirect to user management page
        router.push('/admin/users');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user) return;
    
    if (!confirm(`Are you sure you want to reset the password for "${user.name}"?`)) {
      return;
    }

    try {
      const response = await userApi.resetPassword(userId);
      
      if (response.password) {
        alert(`Password reset successfully!\n\nNew password: ${response.password}\n\nPlease share this with the user securely.`);
      } else {
        alert('Password reset email sent to the user successfully!');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(error.response?.data?.message || 'Failed to reset password. Please try again.');
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
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
            <Link href="/admin/users" className="btn btn-ghost">
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <Link href="/admin/users" className="btn btn-primary">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
        {companyId ? null: <Link href="/admin/users" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            Back to Users
          </Link>}
          <div className="flex items-center">
            <div className="avatar placeholder mr-4">
              <div className="bg-primary text-primary-content rounded-full w-12">
                <span className="text-lg">{user.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Edit {user.name}</h1>
              <p className="text-base-content/70">Update user information and permissions</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePasswordReset}
            className="btn btn-outline btn-warning"
            disabled={isSaving || isDeleting}
          >
            Reset Password
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-error btn-outline"
            disabled={isDeleting || isSaving}
          >
            {isDeleting && <span className="loading loading-spinner loading-sm mr-2"></span>}
            <Trash2 size={16} className="mr-2" />
            Delete User
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h3 className="card-title mb-4">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">User ID:</span>
              <p className="text-base-content/70">#{user.id}</p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p className="text-base-content/70">{formatDateTime(user.created_at)}</p>
            </div>
            <div>
              <span className="font-medium">Last Login:</span>
              <p className="text-base-content/70">{formatDateTime(user.last_login)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-6">Edit User Details</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Full Name *</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Email Address *</span>
                </label>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="john.doe@company.com"
                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Company */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Company *</span>
                </label>
                <div className="input-group">
                  <select
                    className={`select select-bordered w-full ${errors.company_id ? 'select-error' : ''}`}
                    value={formData.company_id}
                    onChange={(e) => handleInputChange('company_id', e.target.value)}
                    disabled={isSaving || loadingCompanies}
                  >
                    <option value="">
                      {loadingCompanies ? 'Loading companies...' : 'Select a company'}
                    </option>
                    {companies.filter(c => c.status === 'active').map((company) => (
                      <option key={company.id} value={company.id.toString()}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.company_id && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.company_id}</span>
                  </label>
                )}
              </div>

              {/* Role */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Role *</span>
                </label>
                <div className="input-group">
                  <select
                    className="select select-bordered w-full"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'editor' | 'viewer')}
                    disabled={isSaving}
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              

              {/* Status */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'pending')}
                  disabled={isSaving}
                >
                  <option value="pending">Pending Approval</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-base-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium mb-3">Preview Changes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-base-content/70">{formData.name || 'Not entered'}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-base-content/70">{formData.email || 'Not entered'}</p>
                </div>
                <div>
                  <span className="font-medium">Company:</span>
                  <p className="text-base-content/70">
                    {formData.company_id 
                      ? companies.find(c => c.id.toString() === formData.company_id)?.name || 'Unknown'
                      : 'Not selected'
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <p className="text-base-content/70 capitalize">{formData.role}</p>
                </div>
                <div>
                  <span className="font-medium">Department:</span>
                  <p className="text-base-content/70">{formData.department || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className={`badge badge-sm ${
                    formData.status === 'active' ? 'badge-success' :
                    formData.status === 'pending' ? 'badge-warning' : 'badge-ghost'
                  }`}>
                    {formData.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-actions justify-end pt-6 border-t border-base-300 mt-6">
              <Link 
                href={companyId ? `/admin/companies/${companyId}` : "/admin/users"} 
                className="btn btn-ghost" 
                onClick={(e) => isSaving && e.preventDefault()}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving && <span className="loading loading-spinner loading-sm mr-2"></span>}
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}