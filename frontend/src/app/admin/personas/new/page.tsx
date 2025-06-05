// frontend/src/app/admin/personas/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Save, Tag, Activity, Building2 } from 'lucide-react';
import Link from 'next/link';
import { personaApi, companyApi } from '@/lib/api';

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

export default function NewPersonaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState('');
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

  // Load platforms, interests, and companies on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setFetchError('');
        
        // Load all data in parallel
        const [platformsResponse, interestsResponse, companiesResponse] = await Promise.all([
          personaApi.getPlatforms(),
          personaApi.getInterests(),
          companyApi.getAll()
        ]);
        
        setPlatforms(platformsResponse);
        setInterests(interestsResponse);
        // Filter only active companies
        setCompanies(companiesResponse.filter((company: Company) => company.status === 'active'));
      } catch (error: any) {
        console.error('Error loading data:', error);
        setFetchError('Failed to load required data. Please try again later.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

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

    setIsLoading(true);
    try {
      const personaData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        age_range: formData.age_range.trim(),
        platforms: formData.platforms,
        interests: formData.interests,
        company_id: parseInt(formData.company_id),
        active: formData.active
      };

      const response = await personaApi.create(personaData);
      
      // Show success message
      alert(`Persona "${formData.name}" created successfully!`);
      
      // Redirect to persona management page
      router.push('/admin/personas');
    } catch (error: any) {
      console.error('Error creating persona:', error);
      
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
        alert(error.response?.data?.message || 'Failed to create persona. Please try again.');
      }
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/admin/personas" className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={16} />
          Back to Personas
        </Link>
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Persona</h1>
            <p className="text-base-content/70">Define a new audience persona for targeted content</p>
          </div>
        </div>
      </div>

      {/* Loading/Error State */}
      {loadingData && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {fetchError && (
        <div className="alert alert-error mb-6">
          <span>{fetchError}</span>
          <button onClick={() => window.location.reload()} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Form */}
      {!loadingData && !fetchError && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    {errors.age_range && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.age_range}</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Company Selection - Full Width */}
                <div className="form-control w-full mt-6">
                  <label className="label">
                    <span className="label-text font-medium">Company *</span>
                  </label>
                  <div className="input-group">
                    <span className="bg-base-200 px-3 flex items-center">
                      <Building2 size={16} className="text-base-content/70" />
                    </span>
                    <select
                      className={`select select-bordered w-full ${errors.company_id ? 'select-error' : ''}`}
                      value={formData.company_id}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      disabled={isLoading}
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
                  <label className="label">
                    <span className="label-text-alt">This persona will be associated with the selected company</span>
                  </label>
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
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.description}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">Provide a detailed description of this audience segment</span>
                  </label>
                </div>

                {/* Status */}
                <div className="form-control mt-6">
                  <label className="label cursor-pointer justify-start">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary mr-3" 
                      checked={formData.active}
                      onChange={(e) => handleActiveChange(e.target.checked)}
                      disabled={isLoading}
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
                  <h3 className="text-lg font-semibold">Key Platforms *</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleSelectAll('platforms')}
                      disabled={isLoading}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleClearAll('platforms')}
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                  <h3 className="text-lg font-semibold">Key Interests *</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleSelectAll('interests')}
                      disabled={isLoading}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleClearAll('interests')}
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                <h4 className="font-medium mb-3">Persona Preview</h4>
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
                  Create Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}