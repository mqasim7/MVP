// frontend/src/app/admin/insights/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText, Save, Building2, Tag, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { insightsApi, companyApi } from '@/lib/api';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface FormData {
  title: string;
  description: string;
  content: string;
  date: string;
  platform: string;
  trend: string;
  image_url: string;
  actionable: boolean;
  category: 'Content' | 'Audience' | 'Engagement' | 'Conversion';
  tags: string[];
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

export default function NewInsightPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    platform: '',
    trend: '',
    image_url: '',
    actionable: false,
    category: 'Content',
    tags: [],
    company_id: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');

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

  // Set company_id in formData if companyId is present in URL
  useEffect(() => {
    if (companyId) setFormData((prev) => ({ ...prev, company_id: companyId }));
  }, [companyId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Insight title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Content validation - check both HTML and plain text length
    const plainTextContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (plainTextContent.length < 50) {
      newErrors.content = 'Content must be at least 50 characters (excluding HTML tags)';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Company validation
    if (!formData.company_id) {
      newErrors.company_id = 'Please select a company';
    }

    // Image URL validation
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
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

  const handleInputChange = (field: keyof Omit<FormData, 'tags' | 'actionable' | 'category' | 'content'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Separate handler for content from RichTextEditor
  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
    // Clear error when user starts typing
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleCategoryChange = (value: 'Content' | 'Audience' | 'Engagement' | 'Conversion') => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleActionableChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, actionable: checked }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const insightData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        date: formData.date,
        platform: formData.platform.trim() || undefined,
        trend: formData.trend.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        actionable: formData.actionable,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        company_id: parseInt(formData.company_id)
      };

      const response = await insightsApi.create(insightData);
      
      // Show success message
      alert(`Insight "${formData.title}" created successfully!`);
      
      // Redirect to company insights or general insights
      if (companyId) router.push(`/admin/companies/${companyId}`);
      else router.push('/admin/insights');
    } catch (error: any) {
      console.error('Error creating insight:', error);
      
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
        alert(error.response?.data?.message || 'Failed to create insight. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn', 'Cross-platform'];
  const suggestedTags = ['engagement', 'content-strategy', 'audience', 'performance', 'trends', 'conversion', 'analytics'];

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href={companyId ? `/admin/companies/${companyId}` : "/admin/insights"}  className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={16} />
          {companyId ? `Back to Company` : `Back to Insights`}
        </Link>
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Insight</h1>
            <p className="text-base-content/70">Share valuable marketing insights and analytics</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {fetchError && (
        <div className="alert alert-error mb-6">
          <span>{fetchError}</span>
          <button onClick={() => window.location.reload()} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Insight Title *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gen Z Content Trends Q2 2025"
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

                {/* Date */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Date *</span>
                  </label>
                  <input
                    type="date"
                    className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.date && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.date}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Company Selection */}
              {!companyId && (
                <div className="form-control w-full mt-6">
                  <label className="label">
                    <span className="label-text font-medium">Company *</span>
                  </label>
                  <div className="input-group">
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
                  </div>
                  {errors.company_id && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.company_id}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">This insight will be associated with the selected company</span>
                  </label>
                </div>
              )}

              {/* Description */}
              <div className="form-control w-full mt-6">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
                  placeholder="Brief description of the insight..."
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
            </div>

            {/* Content - Rich Text Editor */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Content</h3>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Full Content *</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your detailed insight content here. Use the toolbar to format text, add images, and create lists..."
                  disabled={isLoading}
                  error={!!errors.content}
                  className="w-full"
                />
                {errors.content && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.content}</span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt">
                    Use the formatting toolbar to add structure, emphasis, and images to your content
                  </span>
                </label>
              </div>
            </div>

            {/* Categorization */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Categorization</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Category *</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    disabled={isLoading}
                  >
                    <option value="Content">Content</option>
                    <option value="Audience">Audience</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Conversion">Conversion</option>
                  </select>
                </div>

                {/* Platform */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Platform</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Instagram, Cross-platform"
                    list="platforms"
                    className="input input-bordered w-full"
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    disabled={isLoading}
                  />
                  <datalist id="platforms">
                    {suggestedPlatforms.map((platform) => (
                      <option key={platform} value={platform} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Trend */}
              <div className="form-control w-full mt-6">
                <label className="label">
                  <span className="label-text font-medium">Trend</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="e.g. +27% engagement vs. Q1"
                    className="input input-bordered w-full"
                    value={formData.trend}
                    onChange={(e) => handleInputChange('trend', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt">Optional: Describe the trend or metric change</span>
                </label>
              </div>

              {/* Tags */}
              <div className="form-control w-full mt-6">
                <label className="label">
                  <span className="label-text font-medium">Tags</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag"
                    list="suggested-tags"
                    className="input input-bordered flex-1"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleAddTag}
                    disabled={isLoading || !tagInput.trim()}
                  >
                    <Tag size={16} />
                    Add
                  </button>
                </div>
                <datalist id="suggested-tags">
                  {suggestedTags.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                
                {/* Display Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="badge badge-primary gap-2">
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-xs"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isLoading}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              
              {/* Image URL */}
              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text font-medium">Header Image URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/insight-image.jpg"
                  className={`input input-bordered w-full ${errors.image_url ? 'input-error' : ''}`}
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  disabled={isLoading}
                />
                {errors.image_url && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.image_url}</span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt">
                    Optional: URL to a header image for this insight. You can also add images directly in the content using the editor toolbar.
                  </span>
                </label>
              </div>

              {/* Actionable Checkbox */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary mr-3" 
                    checked={formData.actionable}
                    onChange={(e) => handleActionableChange(e.target.checked)}
                    disabled={isLoading}
                  />
                  <div>
                    <span className="label-text font-medium">Actionable Insight</span>
                    <p className="text-sm text-base-content/70">Check if this insight contains actionable recommendations</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Insight Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Title:</span>
                  <p className="text-base-content/70">{formData.title || 'Not entered'}</p>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <p className="text-base-content/70">{formData.category}</p>
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
                  <span className="font-medium">Platform:</span>
                  <p className="text-base-content/70">{formData.platform || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-base-content/70 line-clamp-2">
                    {formData.description || 'Not entered'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Content Preview:</span>
                  <div 
                    className="text-base-content/70 line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content || '<em>No content entered</em>' 
                    }}
                  />
                </div>
                <div>
                  <span className="font-medium">Actionable:</span>
                  <div className={`badge badge-sm ${formData.actionable ? 'badge-success' : 'badge-ghost'}`}>
                    {formData.actionable ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Tags ({formData.tags.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="badge badge-outline badge-xs">
                        {tag}
                      </span>
                    ))}
                    {formData.tags.length > 3 && (
                      <span className="badge badge-outline badge-xs">
                        +{formData.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-actions justify-end pt-6 border-t border-base-300">
              <Link 
                href={companyId ? `/admin/companies/${companyId}` : "/admin/insights"} 
                className="btn btn-ghost" 
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || loadingCompanies}
              >
                {isLoading && <span className="loading loading-spinner loading-sm mr-2"></span>}
                <Save size={16} className="mr-2" />
                Create Insight
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}