// frontend/src/app/admin/companies/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Globe, Save } from 'lucide-react';
import Link from 'next/link';
import { companyApi } from '@/lib/api';

interface FormData {
  name: string;
  description: string;
  industry: string;
  website: string;
  logo_url: string;
  status: 'active' | 'inactive';
}

interface FormErrors {
  [key: string]: string;
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    industry: '',
    website: '',
    logo_url: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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
      const response = await companyApi.create(formData);
      
      // Redirect to company detail page
      router.push(`/admin/companies/${response.company.id}`);
    } catch (error: any) {
      console.error('Error creating company:', error);
      
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
        alert(error.response?.data?.message || 'Failed to create company. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/admin/companies" className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={16} />
          Back to Companies
        </Link>
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Company</h1>
            <p className="text-base-content/70">Add a new company to the platform</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Company Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lululemon"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isLoading}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              {/* Industry */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Industry</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail/Fashion"
                  className={`input input-bordered w-full ${errors.industry ? 'input-error' : ''}`}
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  disabled={isLoading}
                />
                {errors.industry && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.industry}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-control w-full mt-6">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
                placeholder="Brief description of the company and its business"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isLoading}
              />
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description}</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Website */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Website</span>
                </label>
                <div className="input-group">
                 
                  <input
                    type="url"
                    placeholder="https://company.com"
                    className={`input input-bordered w-full ${errors.website ? 'input-error' : ''}`}
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.website && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.website}</span>
                  </label>
                )}
              </div>

              {/* Status */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                  disabled={isLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Logo URL */}
            <div className="form-control w-full mt-6">
              <label className="label">
                <span className="label-text font-medium">Logo URL</span>
              </label>
              <input
                type="url"
                placeholder="https://company.com/logo.png"
                className={`input input-bordered w-full ${errors.logo_url ? 'input-error' : ''}`}
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                disabled={isLoading}
              />
              {errors.logo_url && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.logo_url}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt">Optional: URL to company logo image</span>
              </label>
            </div>

            {/* Preview */}
            {formData.logo_url && isValidUrl(formData.logo_url) && (
              <div className="mt-6">
                <label className="label">
                  <span className="label-text font-medium">Logo Preview</span>
                </label>
                <div className="flex items-center p-4 bg-base-200 rounded-lg">
                  <img
                    src={formData.logo_url}
                    alt="Company logo preview"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="font-medium">{formData.name || 'Company Name'}</p>
                    <p className="text-sm opacity-70">{formData.industry || 'Industry'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card-actions justify-end mt-8 pt-6 border-t border-base-300">
              <Link href="/admin/companies" className="btn btn-ghost" onClick={(e) => isLoading && e.preventDefault()}>
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading && <span className="loading loading-spinner loading-sm mr-2"></span>}
                <Save size={16} className="mr-2" />
                Create Company
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}