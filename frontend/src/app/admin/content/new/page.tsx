// src/app/admin/content/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { contentApi, companyApi, personaApi } from '@/lib/api';

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

interface PersonaOption {
  id: number;
  name: string;
  description: string;
  active: boolean;
  company_id?: number;
  company_name?: string;
}

export default function ContentCreationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<PersonaOption[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    type: 'video',
    description: '',
    persona_id: [],
    url: '',
    company_id: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');  

  useEffect(() => {
    if (companyId) setFormData(prev => ({ ...prev, "company_id": companyId }));
   }, [companyId]);

  // Fetch companies and personas for the dropdowns
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [companiesResponse, personasResponse] = await Promise.all([
          companyApi.getAll(),
          personaApi.getAll()
        ]);
        
        if (mounted) {
          setCompanies(companiesResponse || []);
          setPersonas(personasResponse || []);
          // Initially show all active personas
          setFilteredPersonas((personasResponse || []).filter((persona: PersonaOption) => persona.active));
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (mounted) {
          setFetchError('Failed to load companies and personas. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoadingPersonas(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter personas when company changes
  useEffect(() => {
    if (formData.company_id) {
      const companyPersonas = personas.filter(persona => 
        persona.active && persona.company_id?.toString() === formData.company_id
      );
      setFilteredPersonas(companyPersonas);
      
      // Clear selected personas that don't belong to the new company
      const validPersonaIds = companyPersonas.map(p => p.id.toString());
      const filteredSelectedPersonas = formData.persona_id.filter(id => validPersonaIds.includes(id));
      
      if (filteredSelectedPersonas.length !== formData.persona_id.length) {
        setFormData(prev => ({ ...prev, persona_id: filteredSelectedPersonas }));
      }
    } else {
      // Show all active personas if no company is selected
      setFilteredPersonas(personas.filter(persona => persona.active));
    }
  }, [formData.company_id, personas]);

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
    if (errors.persona_id) {
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
      
      alert('Content created successfully!');
      if(companyId)
      router.push(`/admin/companies/${companyId}`);
      else
      router.push('/admin/content');
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

  const getPersonaDisplayText = (persona: PersonaOption): string => {
    return persona.company_name ? `${persona.name} (${persona.company_name})` : persona.name;
  };

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
      <Link href={companyId ? `/admin/companies/${companyId}` :"/admin/content"} className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            {companyId ? "Back to Company" :"Back to Content"}
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
            {/* <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Content Type *</span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.type ? 'select-error' : ''}`}
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Type</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
              </select>
              {errors.type && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.type}</span>
                </label>
              )}
            </div> */}

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

            {/* Company Selection */}
            {companyId ? null : <div className="form-control w-full mb-4">
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
              <label className="label">
                <span className="label-text-alt">Select a company first to filter relevant personas</span>
              </label>
            </div>}

            {/* Target Personas (Multi-Select) */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Target Personas *</span>
              </label>
              {loadingPersonas ? (
                <div className="flex items-center justify-center p-4 border rounded">
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  <span>Loading personas...</span>
                </div>
              ) : (
                <select
                  className={`select select-bordered w-full ${errors.persona_id ? 'select-error' : ''}`}
                  multiple
                  value={formData.persona_id}
                  onChange={handlePersonasChange}
                  disabled={isLoading}
                  size={Math.min(filteredPersonas.length + 1, 6)}
                >
                  {filteredPersonas.length === 0 ? (
                    <option disabled>
                      {formData.company_id 
                        ? 'No active personas found for selected company'
                        : 'Select a company to see available personas'
                      }
                    </option>
                  ) : (
                    filteredPersonas.map((persona) => (
                      <option key={persona.id} value={persona.id.toString()}>
                        {getPersonaDisplayText(persona)}
                      </option>
                    ))
                  )}
                </select>
              )}
              <label className="label">
                <span className="label-text-alt">
                  Hold Ctrl/Cmd to select multiple. 
                  {formData.persona_id.length > 0 && (
                    <span className="font-medium"> Selected: {formData.persona_id.length}</span>
                  )}
                </span>
              </label>
              {errors.persona_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.persona_id}</span>
                </label>
              )}
            </div>

            {/* Content URL */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Content URL</span>
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
              <label className="label">
                <span className="label-text-alt">Optional: Direct link to the content</span>
              </label>
            </div>

            {/* Preview Section */}
            {(formData.title || formData.company_id || formData.persona_id.length > 0) && (
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3">Content Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="text-base-content/70">{formData.title || 'Not entered'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="text-base-content/70 capitalize">{formData.type || 'Not selected'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Company:</span>
                    <p className="text-base-content/70">
                      {formData.company_id 
                        ? companies.find(c => c.id === formData.company_id)?.name || 'Unknown'
                        : 'Not selected'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Target Personas ({formData.persona_id.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.persona_id.slice(0, 3).map((personaId) => {
                        const persona = filteredPersonas.find(p => p.id.toString() === personaId);
                        return persona ? (
                          <span key={personaId} className="badge badge-primary badge-outline badge-xs">
                            {persona.name}
                          </span>
                        ) : null;
                      })}
                      {formData.persona_id.length > 3 && (
                        <span className="badge badge-primary badge-outline badge-xs">
                          +{formData.persona_id.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  {formData.description && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Description:</span>
                      <p className="text-base-content/70 line-clamp-2">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                disabled={isLoading || loadingPersonas}
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