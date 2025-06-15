// frontend/src/app/admin/users/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Save, Mail, Lock, UserPlus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { userApi, companyApi } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
interface FormData {
  name: string;
  email: string;
  password: string;
  company_id: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Company {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [generatePasswordText, setGeneratePasswordText] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    company_id: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');  

  // Hardcoded values as requested
  const HARDCODED_ROLE = 'viewer';
  const HARDCODED_STATUS = 'active';

  useEffect(() => {
   if (companyId) setFormData(prev => ({ ...prev, "company_id": companyId }));
  }, [companyId]);

  // Load companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        setFetchError('');
        const response = await companyApi.getAll();
        // Filter only active companies
        const activeCompanies = response.filter((company: Company) => company.status === 'active');
        setCompanies(activeCompanies);
      } catch (error: any) {
        console.error('Error loading companies:', error);
        setFetchError('Failed to load companies. Please try again later.');
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Company validation
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

    setIsLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: HARDCODED_ROLE,
        company_id: parseInt(formData.company_id),
        status: HARDCODED_STATUS,
        sendInvite: false // Since we're providing password directly
      };

      const response = await userApi.create(userData);
      
      // Show success message
      alert(`User "${formData.name}" created successfully!`);
      
      if(companyId) {
        // Redirect to company page
        router.push(`/admin/companies/${companyId}`)
      } else {
        // Redirect to user management page
        router.push('/admin/users');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        // Show generic error message
        alert(error.response?.data?.message || 'Failed to create user. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    // Generate a random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange('password', password);
    setGeneratePasswordText(true);
  };

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
       {companyId ? null : <Link href="/admin/users" className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={16} />
          Back to Users
        </Link>}
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New User</h1>
            <p className="text-base-content/70">Create a new user account</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-control w-full mb-6">
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
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name}</span>
                </label>
              )}
            </div>

            {/* Email */}
            <div className="form-control w-full mb-6">
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
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            {/* Company Selection */}
            {companyId ? null :
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-medium">Company *</span>
              </label>
              <div className="input-group">
                {fetchError ? (
                  <div className="flex-1">
                    <div className="alert alert-error">
                      <span className="text-sm">{fetchError}</span>
                    </div>
                  </div>
                ) : (
                  <select
                    className={`select select-bordered w-full ${errors.company_id ? 'select-error' : ''}`}
                    value={formData.company_id}
                    onChange={(e) => handleInputChange('company_id', e.target.value)}
                    disabled={isLoading || loadingCompanies}
                  >
                    <option value="">
                      {loadingCompanies ? 'Loading companies...' : 'Select a company'}
                    </option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id.toString()}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {errors.company_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.company_id}</span>
                </label>
              )}
              {loadingCompanies && (
                <label className="label">
                  <span className="label-text-alt">Loading available companies...</span>
                </label>
              )}
            </div>
            }

            {/* Password */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-medium">Password *</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter password"
                  className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn btn-outline mt-2"
                  onClick={generatePassword}
                  disabled={isLoading}
                >
                  {generatePasswordText ? "Regenerate" : "Generate"}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt">Password must be at least 6 characters</span>
              </label>
            </div>

            {/* Preview Section */}
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-3">User Preview</h3>
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
                  <p className="text-base-content/70">Viewer</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="badge badge-success badge-sm">Active</div>
                </div>
                <div>
                  <span className="font-medium">Password:</span>
                  <p className="text-base-content/70">{formData.password ? '••••••••' : 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-actions justify-end pt-6 border-t border-base-300">
              <Link 
                href={companyId ? `/admin/companies/${companyId}` :`/admin/users`} 
                className="btn btn-ghost" 
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading && <span className="loading loading-spinner loading-sm mr-2"></span>}
                <Save size={16} className="mr-2" />
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}