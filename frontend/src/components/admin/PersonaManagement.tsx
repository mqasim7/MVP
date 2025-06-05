// frontend/src/components/admin/PersonaManagement.tsx  
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, 
  Users, Tag, BarChart2, ExternalLink, Eye,
  FileText, Building2, AlertCircle
} from 'lucide-react';
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
  engagementRate?: string;
}

interface Company {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export default function PersonaManagement() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load personas and companies
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load personas and companies in parallel
      const [personasResponse, companiesResponse] = await Promise.all([
        personaApi.getAll(),
        companyApi.getAll()
      ]);
      
      setPersonas(personasResponse);
      setCompanies(companiesResponse);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.message || 'Failed to load personas and companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (personaId: number, personaName: string) => {
    if (!confirm(`Are you sure you want to delete "${personaName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await personaApi.delete(personaId);
      await loadData(); // Reload data
      alert('Persona deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting persona:', error);
      alert(error.response?.data?.message || 'Failed to delete persona. Please try again.');
    }
  };

  const handleStatusToggle = async (personaId: number, currentStatus: boolean) => {
    try {
      await personaApi.update(personaId, { active: !currentStatus });
      await loadData(); // Reload data
      alert(`Persona ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      console.error('Error updating persona status:', error);
      alert(error.response?.data?.message || 'Failed to update persona status. Please try again.');
    }
  };

  // Filter personas based on search, tab, and company
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        persona.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (persona.company_name && persona.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'active' && persona.active) ||
                     (activeTab === 'inactive' && !persona.active);
    
    const matchesCompany = companyFilter === 'all' || 
                         persona.company_id?.toString() === companyFilter;
    
    return matchesSearch && matchesTab && matchesCompany;
  });

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
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Persona Management</h1>
          <p className="text-base-content/70">Create and manage audience personas for targeted content</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link href="/admin/personas/new" className="btn btn-primary">
            <Plus size={16} />
            Create New Persona
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Personas</div>
          <div className="stat-value text-primary">{personas.length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Active Personas</div>
          <div className="stat-value text-success">
            {personas.filter(p => p.active).length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Companies</div>
          <div className="stat-value">
            {new Set(personas.map(p => p.company_id).filter(Boolean)).size}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Content</div>
          <div className="stat-value">
            {personas.reduce((sum, p) => sum + p.contentCount, 0)}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Search personas..." 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="select select-bordered" 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="all">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id.toString()}>
                {company.name}
              </option>
            ))}
          </select>
          
          <div className="tabs tabs-boxed">
            <a 
              className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </a>
            <a 
              className={`tab ${activeTab === 'active' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </a>
            <a 
              className={`tab ${activeTab === 'inactive' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive
            </a>
          </div>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredPersonas.length > 0 ? (
          filteredPersonas.map(persona => (
            <div key={persona.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="card-title text-lg">{persona.name}</h2>
                  <div className={`badge ${persona.active ? 'badge-success' : 'badge-ghost'}`}>
                    {persona.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <p className="text-base-content/70 text-sm mb-3">{persona.description}</p>
                
                {/* Company Info */}
                {persona.company_name && (
                  <div className="flex items-center mb-3 p-2 bg-base-200 rounded">
                    <Building2 size={14} className="mr-2 text-primary" />
                    <span className="text-sm font-medium">{persona.company_name}</span>
                  </div>
                )}
                
                <div className="divider my-2"></div>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="flex items-center">
                    <Users size={14} className="mr-2 text-primary" />
                    <span>Age: {persona.age_range || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart2 size={14} className="mr-2 text-primary" />
                    <span>Engagement: {persona.engagementRate || '4.7%'}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText size={14} className="mr-2 text-primary" />
                    <span>Content: {persona.contentCount}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag size={14} className="mr-2 text-primary" />
                    <span>Interests: {persona.interests.length}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Platforms:</div>
                  <div className="flex flex-wrap gap-1">
                    {persona.platforms.slice(0, 3).map((platform) => (
                      <span key={platform.id} className="badge badge-outline badge-xs">
                        {platform.name}
                      </span>
                    ))}
                    {persona.platforms.length > 3 && (
                      <span className="badge badge-outline badge-xs">
                        +{persona.platforms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Interests:</div>
                  <div className="flex flex-wrap gap-1">
                    {persona.interests.slice(0, 3).map((interest) => (
                      <span key={interest.id} className="badge badge-primary badge-outline badge-xs">
                        {interest.name}
                      </span>
                    ))}
                    {persona.interests.length > 3 && (
                      <span className="badge badge-primary badge-outline badge-xs">
                        +{persona.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="card-actions justify-between mt-4">
                  <div className="flex gap-1">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleStatusToggle(persona.id, persona.active)}
                    >
                      {persona.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => handleDelete(persona.id, persona.name)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users size={64} className="opacity-20 mb-4" />
            <h3 className="text-lg font-semibold">No personas found</h3>
            <p className="text-base-content/70 mb-4">
              {searchTerm || activeTab !== 'all' || companyFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first persona'
              }
            </p>
            {!searchTerm && activeTab === 'all' && companyFilter === 'all' && (
              <Link href="/admin/personas/new" className="btn btn-primary">
                <Plus size={16} className="mr-2" />
                Create First Persona
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}