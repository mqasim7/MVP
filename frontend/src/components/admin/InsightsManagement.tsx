// frontend/src/components/admin/InsightsManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, MoreVertical,
  Eye, Calendar, CheckCircle, TrendingUp, FileText,
  ArrowUpRight, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { insightsApi } from '@/lib/api';

interface Insight {
  id: number;
  title: string;
  description: string;
  content?: string;
  date: string;
  platform?: string;
  trend?: string;
  image_url?: string;
  actionable: boolean;
  category: 'Content' | 'Audience' | 'Engagement' | 'Conversion';
  author_name?: string;
  tags?: string[];
  company_id?: number;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export default function InsightsManagement() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionableFilter, setActionableFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Load insights on component mount
  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await insightsApi.getAll();
      setInsights(response || []);
    } catch (error: any) {
      console.error('Error loading insights:', error);
      setError(error.response?.data?.message || 'Failed to load insights data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (insight.author_name && insight.author_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (insight.platform && insight.platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (insight.tags && insight.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = categoryFilter === 'all' || insight.category === categoryFilter;
    
    const matchesActionable = actionableFilter === 'all' || 
                             (actionableFilter === 'true' && insight.actionable) ||
                             (actionableFilter === 'false' && !insight.actionable);
    
    return matchesSearch && matchesCategory && matchesActionable;
  });

  const handleDelete = async (insightId: number, insightTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${insightTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(insightId);
    try {
      await insightsApi.delete(insightId);
      setInsights(prev => prev.filter(i => i.id !== insightId));
      alert('Insight deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting insight:', error);
      alert(error.response?.data?.message || 'Failed to delete insight. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Insights Management</h1>
          <p className="text-base-content/70">Create and manage marketing insights and analytics</p>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          {/* <button 
            onClick={loadInsights}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
          <RefreshCw size={16} />
            Refresh
          </button> */}
          <Link href="/admin/insights/new" className="btn btn-primary">
            <Plus size={16} />
            Create New Insight
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-bold">Error loading insights</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button onClick={loadInsights} className="btn btn-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Search insights..." 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-control">
          <select 
            className="select select-bordered"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Content">Content</option>
            <option value="Audience">Audience</option>
            <option value="Engagement">Engagement</option>
            <option value="Conversion">Conversion</option>
          </select>
        </div>

        <div className="form-control">
          <select 
            className="select select-bordered"
            value={actionableFilter}
            onChange={(e) => setActionableFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="true">Actionable</option>
            <option value="false">Informational</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Insights</div>
          <div className="stat-value text-primary">{insights.length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Actionable</div>
          <div className="stat-value text-success">
            {insights.filter(i => i.actionable).length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">This Month</div>
          <div className="stat-value text-info">
            {insights.filter(i => {
              const insightDate = new Date(i.date);
              const now = new Date();
              return insightDate.getMonth() === now.getMonth() && 
                     insightDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Categories</div>
          <div className="stat-value">
            {new Set(insights.map(i => i.category)).size}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || categoryFilter !== 'all' || actionableFilter !== 'all') && (
        <div className="mb-4">
          <p className="text-sm text-base-content/70">
            Showing {filteredInsights.length} of {insights.length} insights
            {(searchTerm || categoryFilter !== 'all' || actionableFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setActionableFilter('all');
                }}
                className="ml-2 link link-primary text-xs"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.length > 0 ? (
          filteredInsights.map(insight => (
            <div key={insight.id} className="card bg-base-100 shadow-xl">
              <figure className="relative">
                <img 
                  src={insight.image_url || "/api/placeholder/400/160"} 
                  alt={insight.title}
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/400/160";
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="badge badge-primary">{insight.category}</div>
                  {insight.actionable && (
                    <div className="badge badge-success gap-1">
                      <CheckCircle size={10} />
                      Actionable
                    </div>
                  )}
                </div>
              </figure>
              
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="card-title text-lg">{insight.title}</h2>
                  
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                      <MoreVertical size={16} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <Link href={`/admin/insights/${insight.id}`}>
                          <Eye size={14} className="mr-2" /> View Details
                        </Link>
                      </li>
                      <li>
                        <Link href={`/admin/insights/${insight.id}/edit`}>
                          <Edit size={14} className="mr-2" /> Edit Insight
                        </Link>
                      </li>
                      <li>
                        <button 
                          className="text-error"
                          onClick={() => handleDelete(insight.id, insight.title)}
                          disabled={isDeleting === insight.id}
                        >
                          {isDeleting === insight.id ? (
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                          ) : (
                            <Trash2 size={14} className="mr-2" />
                          )}
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-sm opacity-70 mb-3 line-clamp-2">{insight.description}</p>
                
                <div className="flex justify-between items-center text-xs mb-2 opacity-70">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{new Date(insight.date).toLocaleDateString()}</span>
                  </div>
                  {insight.platform && (
                    <span className="badge badge-outline badge-sm">{insight.platform}</span>
                  )}
                </div>
                
                {insight.trend && (
                  <div className="flex items-center mb-3 text-success text-sm">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="font-medium">{insight.trend}</span>
                  </div>
                )}

                {insight.company_name && (
                  <div className="mb-2">
                    <span className="badge badge-outline badge-xs">{insight.company_name}</span>
                  </div>
                )}
                
                {insight.tags && insight.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {insight.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="badge badge-outline badge-xs">
                        {tag}
                      </span>
                    ))}
                    {insight.tags.length > 3 && (
                      <span className="badge badge-outline badge-xs">
                        +{insight.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="card-actions justify-between items-center">
                  <span className="text-xs opacity-50">
                    {insight.author_name || 'Unknown Author'}
                  </span>
                  
                  <Link 
                    href={`/admin/insights/${insight.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <FileText size={64} className="mx-auto opacity-20 mb-4" />
            <h3 className="text-lg font-semibold">No insights found</h3>
            <p className="text-base-content/70 mb-4">
              {searchTerm || categoryFilter !== 'all' || actionableFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by creating your first insight'}
            </p>
            {searchTerm || categoryFilter !== 'all' || actionableFilter !== 'all' ? (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setActionableFilter('all');
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/admin/insights/new" className="btn btn-primary">
                <Plus size={16} className="mr-2" />
                Create Insight
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}