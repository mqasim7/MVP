// frontend/src/app/admin/content/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText, Save, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { contentApi, companyApi, personaApi } from '@/lib/api';

interface ContentItem {
  id: number;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'gallery' | 'event';
  status: 'published' | 'draft' | 'scheduled' | 'review';
  content_url?: string;
  thumbnail_url?: string;
  author_id?: number;
  author_name?: string;
  scheduled_date?: string;
  publish_date?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  updated_at: string;
  platforms: { id: number; name: string; }[];
  personas: { id: number; name: string; company_id?: number; }[];
  company_id?: number;
  company_name?: string;
}

interface FormData {
  title: string;
  description: string;
  type: 'video' | 'article' | 'gallery' | 'event';
  status: 'published' | 'draft' | 'scheduled' | 'review';
  content_url: string;
  thumbnail_url: string;
  persona_ids: string[];
  scheduled_date: string;
  company_id: string;
  platforms:string;
}

interface FormErrors {
  [key: string]: string;
}

interface Company {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

interface Persona {
  id: number;
  name: string;
  active: boolean;
  company_id?: number;
  company_name?: string;
}

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = parseInt(params.id as string);

  const [content, setContent] = useState<ContentItem | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'video',
    status: 'draft',
    content_url: '',
    thumbnail_url: '',
    persona_ids: [],
    scheduled_date: '',
    company_id: '',
    platforms: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');  


  // Load content and related data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load content, companies, and personas in parallel
        const [contentResponse, companiesResponse, personasResponse] = await Promise.all([
          contentApi.getById(contentId),
          companyApi.getAll(),
          personaApi.getAll()
        ]);
        
        setContent(contentResponse);
        setCompanies(companiesResponse.filter((company: Company) => company.status === 'active'));
        setPersonas(personasResponse.filter((persona: Persona) => persona.active));
        
        // Populate form with content data
        setFormData({
          title: contentResponse.title || '',
          description: contentResponse.description || '',
          type: contentResponse.type || 'video',
          status: contentResponse.status || 'draft',
          content_url: contentResponse.content_url || '',
          thumbnail_url: contentResponse.thumbnail_url || '',
          persona_ids: contentResponse.personas ? contentResponse.personas.map((p: any) => p.id.toString()) : [],
          scheduled_date: contentResponse.scheduled_date ? contentResponse.scheduled_date.split('T')[0] : '',
          company_id: contentResponse.company_id?.toString() || '',
          platforms: contentResponse.platforms && contentResponse.platforms.length === 1 
          ? contentResponse.platforms[0]?.id : '',
        });
      } catch (error: any) {
        console.error('Error loading data:', error);
        if (error.response?.status === 404) {
          setError('Content not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load content data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [contentId]);

  // Filter personas when company changes
  useEffect(() => {
    if (formData.company_id) {
      const companyPersonas = personas.filter(persona => 
        persona.company_id?.toString() === formData.company_id
      );
      setFilteredPersonas(companyPersonas);
      
      // Clear selected personas that don't belong to the new company
      const validPersonaIds = companyPersonas.map(p => p.id.toString());
      const filteredSelectedPersonas = formData.persona_ids.filter(id => validPersonaIds.includes(id));
      
      if (filteredSelectedPersonas.length !== formData.persona_ids.length) {
        setFormData(prev => ({ ...prev, persona_ids: filteredSelectedPersonas }));
      }
    } else {
      setFilteredPersonas(personas);
    }
  }, [formData.company_id, personas]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Content title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.content_url && !isValidUrl(formData.content_url)) {
      newErrors.content_url = 'Please enter a valid URL';
    }

    if (formData.thumbnail_url && !isValidUrl(formData.thumbnail_url)) {
      newErrors.thumbnail_url = 'Please enter a valid URL';
    }

    if (formData.status === 'scheduled' && !formData.scheduled_date) {
      newErrors.scheduled_date = 'Scheduled date is required when status is scheduled';
    }

    if (!formData.platforms) {
      newErrors.platforms = "Platform is required.";
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

  const handleInputChange = (field: keyof Omit<FormData, 'persona_ids'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePersonasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData(prev => ({ ...prev, persona_ids: selected }));
    if (errors.persona_ids) {
      setErrors(prev => ({ ...prev, persona_ids: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await contentApi.update(contentId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        content_url: formData.content_url.trim() || undefined,
        thumbnail_url: formData.thumbnail_url.trim() || undefined,
        personas: formData.persona_ids.map(id => parseInt(id)),
        scheduled_date: formData.scheduled_date || undefined,
        company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
        platforms: [Number(formData.platforms)]
      });
      
      alert('Content updated successfully!');
      router.push(`/admin/content/${contentId}`);
    } catch (error: any) {
      console.error('Error updating content:', error);
      
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || 'Failed to update content. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!content) return;
    
    if (!confirm(`Are you sure you want to delete "${content.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await contentApi.delete(contentId);
      alert('Content deleted successfully!');
      if(companyId) {
        router.push(`/admin/companies/${companyId}`)
      } else {
        router.push('/admin/content');
      }
    } catch (error: any) {
      console.error('Error deleting content:', error);
      alert(error.response?.data?.message || 'Failed to delete content. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Unknown';
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
            <Link href="/admin/content" className="btn btn-ghost">
              Back to Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <Link href="/admin/content" className="btn btn-primary">
            Back to Content
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
        <Link href={companyId ? `/admin/content/${contentId}?companyId=${companyId}` :"/admin/content"} className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            Back to Content
          </Link>
          <div className="flex items-center">
            <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Edit {content.title}</h1>
              <p className="text-base-content/70">Update content information</p>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="btn btn-error btn-outline"
          disabled={isDeleting || isSaving}
        >
          {isDeleting && <span className="loading loading-spinner loading-sm mr-2"></span>}
          <Trash2 size={16} className="mr-2" />
          Delete Content
        </button>
      </div>

      {/* Content Info Card */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h3 className="card-title mb-4">Content Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Content ID:</span>
              <p className="text-base-content/70">#{content.id}</p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p className="text-base-content/70">{formatDateTime(content.created_at)}</p>
            </div>
            <div>
              <span className="font-medium">Views:</span>
              <p className="text-base-content/70">{content.views.toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium">Author:</span>
              <p className="text-base-content/70">{content.author_name || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium">Current Status:</span>
              <div className={`badge badge-sm ${
                content.status === 'published' ? 'badge-success' :
                content.status === 'scheduled' ? 'badge-info' :
                content.status === 'review' ? 'badge-warning' : 'badge-ghost'
              }`}>
                {content.status}
              </div>
            </div>
            <div>
              <span className="font-medium">Engagement:</span>
              <p className="text-base-content/70">{content.likes + content.comments + content.shares} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-6">Edit Content Details</h3>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Title */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="Content title"
                  className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isSaving}
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.title}</span>
                  </label>
                )}
              </div>

              {/* Type */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Type *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as any)}
                  disabled={isSaving}
                >
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="gallery">Gallery</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-medium">Description *</span>
              </label>
              <textarea
                className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
                placeholder="Content description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isSaving}
              />
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description}</span>
                </label>
              )}
            </div>

            {/* Status and Scheduled Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Status */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Status *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  disabled={isSaving}
                >
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Scheduled Date */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Scheduled Date {formData.status === 'scheduled' && '*'}
                  </span>
                </label>
                <input
                  type="date"
                  className={`input input-bordered w-full ${errors.scheduled_date ? 'input-error' : ''}`}
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  disabled={isSaving}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.scheduled_date && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.scheduled_date}</span>
                  </label>
                )}
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Content URL */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Content URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/content"
                  className={`input input-bordered w-full ${errors.content_url ? 'input-error' : ''}`}
                  value={formData.content_url}
                  onChange={(e) => handleInputChange('content_url', e.target.value)}
                  disabled={isSaving}
                />
                {errors.content_url && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.content_url}</span>
                  </label>
                )}
              </div>

              {/* Thumbnail URL */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Thumbnail URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  className={`input input-bordered w-full ${errors.thumbnail_url ? 'input-error' : ''}`}
                  value={formData.thumbnail_url}
                  onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                  disabled={isSaving}
                />
                {errors.thumbnail_url && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.thumbnail_url}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Company Selection */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-medium">Company</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.company_id}
                onChange={(e) => handleInputChange('company_id', e.target.value)}
                disabled={isSaving}
              >
                <option value="">No company assigned</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id.toString()}>
                    {company.name}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt">Select a company to filter relevant personas</span>
              </label>
            </div>

            {/* Target Personas */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-medium">Target Personas</span>
              </label>
              <select
                className="select select-bordered w-full"
                multiple
                value={formData.persona_ids}
                onChange={handlePersonasChange}
                disabled={isSaving}
                size={Math.min(filteredPersonas.length + 1, 6)}
              >
                {filteredPersonas.length === 0 ? (
                  <option disabled>
                    {formData.company_id 
                      ? 'No personas found for selected company'
                      : 'Select a company to see available personas'
                    }
                  </option>
                ) : (
                  filteredPersonas.map((persona) => (
                    <option key={persona.id} value={persona.id.toString()}>
                      {persona.name} {persona.company_name && `(${persona.company_name})`}
                    </option>
                  ))
                )}
              </select>
              <label className="label">
                <span className="label-text-alt">
                  Hold Ctrl/Cmd to select multiple. 
                  {formData.persona_ids.length > 0 && (
                    <span className="font-medium"> Selected: {formData.persona_ids.length}</span>
                  )}
                </span>
              </label>
            </div>

              {/* Platform Selection */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Platform *</span>
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.platforms ? "select-error" : ""
                  }`}
                  value={formData.platforms}
                  onChange={(e) => handleInputChange("platforms", e.target.value)}
                  disabled={isLoading}
                >
                  <option value={""}>Select platform</option>
                  <option value={"1"}>Instagram</option>
                  <option value={"2"}>TikTok</option>
                </select>
                {errors.platforms && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.platforms}
                    </span>
                  </label>
                )}
              </div>

            {/* Preview Section */}
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Preview Changes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Title:</span>
                  <p className="text-base-content/70">{formData.title || 'Not entered'}</p>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="text-base-content/70 capitalize">{formData.type}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className={`badge badge-sm ${
                    formData.status === 'published' ? 'badge-success' :
                    formData.status === 'scheduled' ? 'badge-info' :
                    formData.status === 'review' ? 'badge-warning' : 'badge-ghost'
                  }`}>
                    {formData.status}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Company:</span>
                  <p className="text-base-content/70">
                    {formData.company_id 
                      ? companies.find(c => c.id.toString() === formData.company_id)?.name || 'Unknown'
                      : 'Not assigned'
                    }
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-base-content/70 line-clamp-2">
                    {formData.description || 'Not entered'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Target Personas ({formData.persona_ids.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.persona_ids.slice(0, 5).map((personaId) => {
                      const persona = filteredPersonas.find(p => p.id.toString() === personaId);
                      return persona ? (
                        <span key={personaId} className="badge badge-primary badge-outline badge-xs">
                          {persona.name}
                        </span>
                      ) : null;
                    })}
                    {formData.persona_ids.length > 5 && (
                      <span className="badge badge-primary badge-outline badge-xs">
                        +{formData.persona_ids.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-actions justify-end pt-6 border-t border-base-300">
              <Link 
                href={`/admin/content/${contentId}`} 
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