// frontend/src/app/admin/personas/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Save, Trash2, Tag, Activity, Building2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { personaApi, companyApi } from '@/lib/api';

interface Persona {
  id: number;
  name: string;
  description: string;
  age_range?: string;
  company_id?: number;
  company_name?: string;
  platforms: { id: number; name: string; }[];
  interests: { id: number; name: string; }[];
  active: boolean;
  contentCount: number;
  created_at?: string;
}

interface FormData {
  name: string;
  description: string;
  age_range: string;
  platforms: string[];
  interests: string[];
  company_id: string;
  active: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface Platform {
  id: number;
  name: string;
}

interface Interest {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export default function EditPersonaPage() {
  const router = useRouter();
  const params = useParams();
  const personaId = parseInt(params.id as string);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    age_range: '',
    platforms: [],
    interests: [],
    company_id: '',
    active: true
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load persona and related data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load all data in parallel
        const [personaResponse, platformsResponse, interestsResponse, companiesResponse] = await Promise.all([
          personaApi.getById(personaId),
          personaApi.getPlatforms(),
          personaApi.getInterests(),
          companyApi.getAll()
        ]);
        
        setPersona(personaResponse);
        setPlatforms(platformsResponse);
        setInterests(interestsResponse);
        setCompanies(companiesResponse.filter((company: Company) => company.status === 'active'));
        
        // Populate form with persona data
        setFormData({
          name: personaResponse.name || '',
          description: personaResponse.description || '',
          age_range: personaResponse.age_range || '',
          platforms: personaResponse.platforms ? personaResponse.platforms.map((p: { name: any; }) => p.name) : [],
          interests: personaResponse.interests ? personaResponse.interests.map((i: { name: any; }) => i.name) : [],
          company_id: personaResponse.company_id?.toString() || '',
          active: personaResponse.active !== undefined ? personaResponse.active : true
        });
      } catch (error: any) {
        console.error('Error loading data:', error);
        if (error.response?.status === 404) {
          setError('Persona not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load persona data');
        }
      } finally {
        setIsLoading(false);
        setLoadingData(false);
      }
    };

    loadData();
  }, [personaId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Persona name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Persona name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Age range validation
    if (!formData.age_range.trim()) {
      newErrors.age_range = 'Age range is required';
    }

    // Company validation
    if (!formData.company_id) {
      newErrors.company_id = 'Please select a company';
    }

    // Platforms validation
    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform';
    }

    // Interests validation
    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Omit<FormData, 'platforms' | 'interests' | 'active' | 'company_id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCompanyChange = (value: string) => {
    setFormData(prev => ({ ...prev, company_id: value }));
    // Clear error when user makes selection
    if (errors.company_id) {
      setErrors(prev => ({ ...prev, company_id: '' }));
    }
  };

  const handleCheckboxChange = (field: 'platforms' | 'interests', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const isSelected = currentArray.includes(value);
      
      let newArray;
      if (isSelected) {
        // Remove from array
        newArray = currentArray.filter(item => item !== value);
      } else {
        // Add to array
        newArray = [...currentArray, value];
      }
      
      return { ...prev, [field]: newArray };
    });
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await personaApi.update(personaId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        age_range: formData.age_range.trim(),
        platforms: formData.platforms,
        interests: formData.interests,
        company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
        active: formData.active
      });
      
      alert('Persona updated successfully!');
      router.push('/admin/personas');
    } catch (error: any) {
      console.error('Error updating persona:', error);
      
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || 'Failed to update persona. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!persona) return;
    
    if (!confirm(`Are you sure you want to delete "${persona.name}"? This action cannot be undone and will affect all associated content.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await personaApi.delete(personaId);
      alert('Persona deleted successfully!');
      router.push('/admin/personas');
    } catch (error: any) {
      console.error('Error deleting persona:', error);
      alert(error.response?.data?.message || 'Failed to delete persona. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (field: 'platforms' | 'interests') => {
    const allOptions = field === 'platforms' ? platforms : interests;
    const allValues = allOptions.map(item => item.name);
    setFormData(prev => ({ ...prev, [field]: allValues }));
    
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClearAll = (field: 'platforms' | 'interests') => {
    setFormData(prev => ({ ...prev, [field]: [] }));
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
            <Link href="/admin/personas" className="btn btn-ghost">
              Back to Personas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Persona Not Found</h1>
          <Link href="/admin/personas" className="btn btn-primary">
            Back to Personas
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
          <Link href="/admin/personas" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            Back to Personas
          </Link>
          <div className="flex items-center">
            <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Edit {persona.name}</h1>
              <p className="text-base-content/70">Update persona information and targeting</p>
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
          Delete Persona
        </button>
      </div>

      {/* Persona Info Card */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h3 className="card-title mb-4">Persona Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Persona ID:</span>
              <p className="text-base-content/70">#{persona.id}</p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p className="text-base-content/70">{formatDateTime(persona.created_at)}</p>
            </div>
            <div>
              <span className="font-medium">Content Count:</span>
              <p className="text-base-content/70">{persona.contentCount}</p>
            </div>
            <div>
              <span className="font-medium">Current Company:</span>
              <p className="text-base-content/70">{persona.company_name || 'No company assigned'}</p>
            </div>
            <div>
              <span className="font-medium">Current Status:</span>
              <div className={`badge badge-sm ${persona.active ? 'badge-success' : 'badge-ghost'}`}>
                {persona.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div>
              <span className="font-medium">Current Platforms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {persona.platforms.slice(0, 2).map((platform) => (
                  <span key={platform.id} className="badge badge-outline badge-xs">
                    {platform.name}
                  </span>
                ))}
                {persona.platforms.length > 2 && (
                  <span className="badge badge-outline badge-xs">
                    +{persona.platforms.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-6">Edit Persona Details</h3>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Persona Name */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Persona Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mindful Movers (Gen Z)"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isSaving}
                  />
                  {errors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.name}</span>
                    </label>
                  )}
                </div>

                {/* Age Range */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Age Range *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18-24, 25-34"
                    className={`input input-bordered w-full ${errors.age_range ? 'input-error' : ''}`}
                    value={formData.age_range}
                    onChange={(e) => handleInputChange('age_range', e.target.value)}
                    disabled={isSaving}
                  />
                  {errors.age_range && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.age_range}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Company Selection */}
              <div className="form-control w-full mt-6">
                <label className="label">
                  <span className="label-text font-medium">Company *</span>
                </label>
                <div className="input-group">
                  <select
                    className={`select select-bordered w-full ${errors.company_id ? 'select-error' : ''}`}
                    value={formData.company_id}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    disabled={isSaving}
                  >
                    <option value="">Select a company</option>
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
              </div>

              {/* Description */}
              <div className="form-control w-full mt-6">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
                  placeholder="Describe this persona's key characteristics, behaviors, and motivations..."
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

              {/* Status */}
              <div className="form-control mt-6">
                <label className="label cursor-pointer justify-start">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary mr-3" 
                    checked={formData.active}
                    onChange={(e) => handleActiveChange(e.target.checked)}
                    disabled={isSaving}
                  />
                  <div>
                    <span className="label-text font-medium">Active Persona</span>
                    <p className="text-sm text-base-content/70">Enable this persona for content targeting</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Platforms Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Key Platforms *</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleSelectAll('platforms')}
                    disabled={isSaving}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleClearAll('platforms')}
                    disabled={isSaving}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg ${errors.platforms ? 'border-error' : 'border-base-300'}`}>
                {platforms.map((platform) => (
                  <label key={platform.id} className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mr-2"
                      checked={formData.platforms.includes(platform.name)}
                      onChange={() => handleCheckboxChange('platforms', platform.name)}
                      disabled={isSaving}
                    />
                    <span className="label-text">{platform.name}</span>
                  </label>
                ))}
              </div>
              {errors.platforms && (
                <div className="mt-2">
                  <span className="text-error text-sm">{errors.platforms}</span>
                </div>
              )}
              <div className="mt-2">
                <span className="text-sm text-base-content/70">
                  Selected: {formData.platforms.length} platform{formData.platforms.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Interests Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Key Interests *</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleSelectAll('interests')}
                    disabled={isSaving}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleClearAll('interests')}
                    disabled={isSaving}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg ${errors.interests ? 'border-error' : 'border-base-300'}`}>
                {interests.map((interest) => (
                  <label key={interest.id} className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mr-2"
                      checked={formData.interests.includes(interest.name)}
                      onChange={() => handleCheckboxChange('interests', interest.name)}
                      disabled={isSaving}
                    />
                    <span className="label-text">{interest.name}</span>
                  </label>
                ))}
              </div>
              {errors.interests && (
                <div className="mt-2">
                  <span className="text-error text-sm">{errors.interests}</span>
                </div>
              )}
              <div className="mt-2">
                <span className="text-sm text-base-content/70">
                  Selected: {formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Preview Changes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-base-content/70">{formData.name || 'Not entered'}</p>
                </div>
                <div>
                  <span className="font-medium">Age Range:</span>
                  <p className="text-base-content/70">{formData.age_range || 'Not entered'}</p>
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
                  <span className="font-medium">Status:</span>
                  <div className={`badge badge-sm ${formData.active ? 'badge-success' : 'badge-ghost'}`}>
                    {formData.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-base-content/70 line-clamp-2">
                    {formData.description || 'Not entered'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Platforms ({formData.platforms.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.platforms.slice(0, 3).map((platform, index) => (
                      <span key={index} className="badge badge-outline badge-xs">
                        {platform}
                      </span>
                    ))}
                    {formData.platforms.length > 3 && (
                      <span className="badge badge-outline badge-xs">
                        +{formData.platforms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Interests ({formData.interests.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="badge badge-primary badge-outline badge-xs">
                        {interest}
                      </span>
                    ))}
                    {formData.interests.length > 3 && (
                      <span className="badge badge-primary badge-outline badge-xs">
                        +{formData.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-actions justify-end pt-6 border-t border-base-300">
              <Link 
                href="/admin/personas" 
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