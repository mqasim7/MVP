// frontend/src/components/admin/InsightsManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, MoreVertical,
  Eye, Calendar, CheckCircle, TrendingUp, FileText,
  ArrowUpRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

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
  created_at: string;
  updated_at: string;
}

export default function InsightsManagement() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionableFilter, setActionableFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    date: '',
    platform: '',
    trend: '',
    image_url: '',
    actionable: false,
    category: 'Content' as 'Content' | 'Audience' | 'Engagement' | 'Conversion',
    tags: [] as string[]
  });

  // Mock data - replace with actual API calls
  const mockInsights: Insight[] = [
    {
      id: 1,
      title: "Gen Z Content Trends Q2 2025",
      description: "Analysis of top-performing content patterns across platforms",
      content: "<h2>Key Findings</h2><p>Gen Z audiences are increasingly engaging with authentic, unfiltered content...</p>",
      date: "2025-05-15",
      platform: "Cross-platform",
      trend: "+27% engagement vs. Q1",
      actionable: true,
      category: "Content",
      author_name: "Marketing Team",
      tags: ["gen-z", "trends", "social-media"],
      created_at: "2025-05-15T10:00:00Z",
      updated_at: "2025-05-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Athleticwear Video Performance",
      description: "How video product demos are outperforming static images",
      content: "<h2>Video Performance Metrics</h2><p>Product demonstration videos show 45% higher engagement...</p>",
      date: "2025-05-12",
      platform: "Instagram",
      trend: "+45% view completion rate",
      actionable: true,
      category: "Content",
      author_name: "Content Team",
      tags: ["video", "product-demo", "instagram"],
      created_at: "2025-05-12T09:00:00Z",
      updated_at: "2025-05-12T09:00:00Z"
    },
    {
      id: 3,
      title: "Wellness Content Strategy",
      description: "Mindfulness content resonating with core audience segments",
      date: "2025-05-10",
      platform: "TikTok",
      trend: "+38% follower growth",
      actionable: false,
      category: "Audience",
      author_name: "Analytics Team",
      tags: ["wellness", "mindfulness", "tiktok"],
      created_at: "2025-05-10T14:00:00Z",
      updated_at: "2025-05-10T14:00:00Z"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInsights(mockInsights);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || insight.category === categoryFilter;
    
    const matchesActionable = actionableFilter === 'all' || 
                             (actionableFilter === 'true' && insight.actionable) ||
                             (actionableFilter === 'false' && !insight.actionable);
    
    return matchesSearch && matchesCategory && matchesActionable;
  });

  const handleModalOpen = (insight?: Insight) => {
    if (insight) {
      setEditingInsight(insight);
      setFormData({
        title: insight.title,
        description: insight.description,
        content: insight.content || '',
        date: insight.date,
        platform: insight.platform || '',
        trend: insight.trend || '',
        image_url: insight.image_url || '',
        actionable: insight.actionable,
        category: insight.category,
        tags: insight.tags || []
      });
    } else {
      setEditingInsight(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        platform: '',
        trend: '',
        image_url: '',
        actionable: false,
        category: 'Content',
        tags: []
      });
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInsight(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingInsight) {
        // Update insight API call
        console.log('Updating insight:', editingInsight.id, formData);
        
        // Update local state
        setInsights(prev => prev.map(i => 
          i.id === editingInsight.id 
            ? { 
                ...i, 
                ...formData, 
                updated_at: new Date().toISOString(),
                author_name: i.author_name // Keep existing author
              }
            : i
        ));
      } else {
        // Create insight API call
        console.log('Creating insight:', formData);
        
        // Add to local state (mock)
        const newInsight: Insight = {
          id: Date.now(),
          ...formData,
          author_name: 'Current User', // Would come from auth context
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setInsights(prev => [newInsight, ...prev]);
      }
      
      handleModalClose();
    } catch (error) {
      console.error('Error saving insight:', error);
    }
  };

  const handleDelete = async (insightId: number) => {
    if (!confirm('Are you sure you want to delete this insight?')) {
      return;
    }
    
    try {
      console.log('Deleting insight:', insightId);
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
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
        <div className="mt-4 lg:mt-0">
          <button 
            className="btn btn-primary"
            onClick={() => handleModalOpen()}
          >
            <Plus size={16} />
            Create New Insight
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <span className="bg-base-200 px-2">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search insights..." 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
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
          
          <select 
            className="select select-bordered" 
            value={actionableFilter}
            onChange={(e) => setActionableFilter(e.target.value)}
          >
            <option value="all">All Insights</option>
            <option value="true">Actionable Only</option>
            <option value="false">Non-Actionable</option>
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
            {insights.filter(i => new Date(i.date).getMonth() === new Date().getMonth()).length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Categories</div>
          <div className="stat-value">
            {new Set(insights.map(i => i.category)).size}
          </div>
        </div>
      </div>

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
                        <Link href={`/dashboard/insights/${insight.id}`}>
                          <Eye size={14} className="mr-2" /> View Insight
                        </Link>
                      </li>
                      <li>
                        <a onClick={() => handleModalOpen(insight)}>
                          <Edit size={14} className="mr-2" /> Edit
                        </a>
                      </li>
                      <li>
                        <a 
                          className="text-error"
                          onClick={() => handleDelete(insight.id)}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-sm opacity-70 mb-3">{insight.description}</p>
                
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
                    {insight.author_name}
                  </span>
                  
                  <Link 
                    href={`/dashboard/insights/${insight.id}`}
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
            <button 
              className="btn btn-primary"
              onClick={() => handleModalOpen()}
            >
              <Plus size={16} className="mr-2" />
              Create Insight
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Insight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg">
              {editingInsight ? 'Edit Insight' : 'Create New Insight'}
            </h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleModalClose}
            >
              ✕
            </button>
            
            <form onSubmit={handleSubmit} className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Title *</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Insight title" 
                    className="input input-bordered w-full" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Date *</span>
                  </label>
                  <input 
                    type="date" 
                    className="input input-bordered w-full" 
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Description *</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-20" 
                  placeholder="Brief description of the insight"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                ></textarea>
              </div>
              
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Content (HTML)</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-32" 
                  placeholder="Full insight content in HTML format"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Category *</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    required
                  >
                    <option value="Content">Content</option>
                    <option value="Audience">Audience</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Conversion">Conversion</option>
                  </select>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Platform</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Instagram, Cross-platform" 
                    className="input input-bordered w-full" 
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Trend</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. +27% engagement vs. Q1" 
                    className="input input-bordered w-full" 
                    value={formData.trend}
                    onChange={(e) => setFormData(prev => ({ ...prev, trend: e.target.value }))}
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Image URL</span>
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    className="input input-bordered w-full" 
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Tags (comma separated)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. gen-z, trends, social-media" 
                  className="input input-bordered w-full" 
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label cursor-pointer justify-start">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary mr-2" 
                    checked={formData.actionable}
                    onChange={(e) => setFormData(prev => ({ ...prev, actionable: e.target.checked }))}
                  />
                  <span className="label-text">This insight contains actionable recommendations</span>
                </label>
              </div>
              
              <div className="modal-action mt-6">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingInsight ? 'Update Insight' : 'Create Insight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}