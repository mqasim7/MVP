// src/app/admin/content/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { contentApi, companyApi } from '@/lib/api';

interface ContentFormData {
  title: string;
  type: 'video' | 'article' | '';
  description: string;
  persona_id: string[];
  url: string;
  company_id: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CompanyOption {
  id: string;
  name: string;
}

export default function ContentCreationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    type: '',
    description: '',
    persona_id: [],
    url: '',
    company_id: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch companies for the dropdown
  useEffect(() => {
    let mounted = true;
    const loadCompanies = async () => {
      try {
        const response = await companyApi.getAll();
        // Assume response.companies is an array of { id: string; name: string }
        if (mounted) {
          setCompanies(response || []);
        }
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        if (mounted) {
          setFetchError('Failed to load companies. Please try again later.');
        }
      }
    };
    loadCompanies();
    return () => {
      mounted = false;
    };
  }, []);

  const isValidUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Content title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a content type';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.persona_id.length) {
      newErrors.persona_id = 'Select at least one persona';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Please select a company';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof Omit<ContentFormData, 'persona_id'>,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePersonasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, persona_id: selected }));
    if (errors.personas) {
      setErrors((prev) => ({ ...prev, persona_id: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        description: formData.description.trim(),
        personas: formData.persona_id,
        url: formData.url.trim(),
        company_id: formData.company_id,
        content_url: formData.url
      };
      const response = await contentApi.create(payload);
      
      // router.push(`/admin/content/${response.content.id}`);
    } catch (error: any) {
      console.error('Error creating content:', error);
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || 'Failed to create content. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/admin/content" className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={16} />
          Back to Content
        </Link>
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Content</h1>
            <p className="text-base-content/70">Add a new content to the platform</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Content Title */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Content Title *</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isLoading}
              />
              {errors.title && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.title}</span>
                </label>
              )}
            </div>

            {/* Content Type */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Content Type *</span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.type ? 'select-error' : ''}`}
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={isLoading}
              >
                <option>Select Type</option>
                <option value="video">Video</option>
              </select>
              {errors.type && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.type}</span>
                </label>
              )}
            </div>

            {/* Description */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Description *</span>
              </label>
              <textarea
                className={`textarea textarea-bordered w-full h-24 ${
                  errors.description ? 'textarea-error' : ''
                }`}
                placeholder="Content description"
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

            {/* Target Personas (Multi-Select) */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Target Personas *</span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.persona_id ? 'select-error' : ''}`}
                multiple
                value={formData.persona_id}
                onChange={handlePersonasChange}
                disabled={isLoading}
              >
                <option value="1">Mindful Movers (Gen Z)</option>
                <option value="2">Active Professionals</option>
                <option value="3">Outdoor Enthusiasts</option>
                <option value="4">Yoga Practitioners</option>
              </select>
              <label className="label">
                <span className="label-text-alt">Hold Ctrl/Cmd to select multiple</span>
              </label>
              {errors.persona_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.persona_id}</span>
                </label>
              )}
            </div>

            {/* Company Selection */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Company *</span>
              </label>
              {fetchError ? (
                <p className="text-error">{fetchError}</p>
              ) : (
                <select
                  className={`select select-bordered w-full ${
                    errors.company_id ? 'select-error' : ''
                  }`}
                  value={formData.company_id}
                  onChange={(e) => handleInputChange('company_id', e.target.value)}
                  disabled={isLoading || companies.length === 0}
                >
                  <option value="">Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.company_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.company_id}</span>
                </label>
              )}
            </div>

            {/* Content URL */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Content URL *</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/content"
                className={`input input-bordered w-full ${errors.url ? 'input-error' : ''}`}
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                disabled={isLoading}
              />
              {errors.url && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.url}</span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="card-actions justify-end mt-6 pt-4 border-t border-base-300">
              <Link
                href="/admin/content"
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
                {isLoading && (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                )}
                <Save size={16} className="mr-2" />
                Create Content
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
