// frontend/src/components/admin/CompanyManagement.tsx 
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, MoreVertical, Building2,
  Users, Activity, Globe, Eye, Settings, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { companyApi } from '@/lib/api';
import { resetViewportZoom } from '@/lib/utils';

interface Company {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  user_count: number;
  created_at: string;
  updated_at: string;
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Reset viewport zoom on mount (iOS Safari fix)
  useEffect(() => {
    resetViewportZoom();
  }, []);
  
  // Load companies
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await companyApi.getAll();
      setCompanies(response);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      setError(error.response?.data?.message || 'Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (companyId: number, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone and will affect all associated users.`)) {
      return;
    }
    
    setDeletingId(companyId);
    try {
      await companyApi.delete(companyId);
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      alert('Company deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting company:', error);
      alert(error.response?.data?.message || 'Failed to delete company. It may have existing users.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (companyId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await companyApi.update(companyId, { status: newStatus });
      setCompanies(prev => prev.map(c => 
        c.id === companyId 
          ? { ...c, status: newStatus as 'active' | 'inactive', updated_at: new Date().toISOString() }
          : c
      ));
    } catch (error: any) {
      console.error('Error updating company status:', error);
      alert(error.response?.data?.message || 'Failed to update company status');
    }
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
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadCompanies}>
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
          <h1 className="text-2xl font-bold">Company Management</h1>
          <p className="text-base-content/70">Manage companies and their access to the platform</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link href="/admin/companies/new" className="btn btn-primary">
            <Plus size={16} />
            Add New Company
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Companies</div>
          <div className="stat-value text-primary">{companies.length}</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Active Companies</div>
          <div className="stat-value text-success">
            {companies.filter(c => c.status === 'active').length}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="form-control">
            <div className="input-group">
              
              <input 
                type="text" 
                placeholder="Search companies..." 
                className="input input-bordered w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map(company => (
            <div key={company.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`bg-primary text-primary-content p-2 rounded-full mr-3 ${company.logo_url ? 'hidden' : ''}`}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="card-title text-lg">{company.name}</h2>
                      <div className={`badge ${company.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                        {company.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                      <MoreVertical size={16} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <Link href={`/admin/companies/${company.id}`}>
                          <Eye size={14} className="mr-2" /> View Details
                        </Link>
                      </li>
                      <li>
                        <Link href={`/admin/companies/${company.id}/edit`}>
                          <Edit size={14} className="mr-2" /> Edit
                        </Link>
                      </li>
                      <li>
                        <a onClick={() => handleStatusToggle(company.id, company.status)}>
                          <Activity size={14} className="mr-2" />
                          {company.status === 'active' ? 'Deactivate' : 'Activate'}
                        </a>
                      </li>
                      <li>
                        <a 
                          className="text-error"
                          onClick={() => handleDelete(company.id, company.name)}
                        >
                          {deletingId === company.id ? (
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                          ) : (
                            <Trash2 size={14} className="mr-2" />
                          )}
                          Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {company.description && (
                  <p className="text-sm opacity-70 mb-3 line-clamp-2">{company.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {company.industry && (
                    <div>
                      <span className="font-medium">Industry:</span>
                      <br />
                      <span className="opacity-70">{company.industry}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Users:</span>
                    <br />
                    <span className="opacity-70">{company.user_count}</span>
                  </div>
                </div>
                
                {company.website && (
                  <div className="mt-3">
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm gap-2"
                    >
                      <Globe size={14} />
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="card-actions justify-between mt-4">
                  <span className="text-xs opacity-50">
                    Created {new Date(company.created_at).toLocaleDateString()}
                  </span>
                  
                  <Link 
                    href={`/admin/companies/${company.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <Users size={14} className="mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <Building2 size={64} className="mx-auto opacity-20 mb-4" />
            <h3 className="text-lg font-semibold">
              {searchTerm ? 'No companies found' : 'No companies yet'}
            </h3>
            <p className="text-base-content/70 mb-4">
              {searchTerm 
                ? 'Try adjusting your search term' 
                : 'Start by creating your first company'}
            </p>
            {!searchTerm && (
              <Link href="/admin/companies/new" className="btn btn-primary">
                <Plus size={16} className="mr-2" />
                Create Company
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Load more or pagination could go here */}
      {filteredCompanies.length > 0 && filteredCompanies.length < companies.length && (
        <div className="text-center mt-8">
          <p className="text-sm opacity-70">
            Showing {filteredCompanies.length} of {companies.length} companies
          </p>
        </div>
      )}
    </div>
  );
}