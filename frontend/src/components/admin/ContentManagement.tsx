// frontend/src/components/admin/ContentManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, 
  ArrowUp, ArrowDown, MoreVertical, FileText, 
  Image, Video, File, AlertCircle, Users, Calendar,
  ExternalLink, CheckCircle, Clock, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { contentApi } from '@/lib/api';

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
  personas: { id: number; name: string; }[];
}

export default function ContentManagement() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load content items
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentApi.getAll();
      setContentItems(response);
    } catch (error: any) {
      console.error('Error loading content:', error);
      setError(error.response?.data?.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort content
  const filteredContent = contentItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.author_name && item.author_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a: any, b: any) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Delete content item
  const handleDelete = async (contentId: number, contentTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${contentTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(contentId);
    try {
      await contentApi.delete(contentId);
      await loadContent(); // Reload content
      alert('Content deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting content:', error);
      alert(error.response?.data?.message || 'Failed to delete content. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Publish content
  const handlePublish = async (contentId: number, contentTitle: string) => {
    if (!confirm(`Are you sure you want to publish "${contentTitle}"?`)) {
      return;
    }
    
    try {
      await contentApi.publish(contentId);
      await loadContent(); // Reload content
      alert('Content published successfully!');
    } catch (error: any) {
      console.error('Error publishing content:', error);
      alert(error.response?.data?.message || 'Failed to publish content. Please try again.');
    }
  };

  // Content type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'article':
        return <FileText size={16} />;
      case 'gallery':
        return <Image size={16} />;
      default:
        return <File size={16} />;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { class: 'badge-success', icon: CheckCircle },
      draft: { class: 'badge-warning', icon: Edit },
      scheduled: { class: 'badge-info', icon: Clock },
      review: { class: 'badge-ghost', icon: Eye }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class} gap-1`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
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
          <button className="btn btn-sm" onClick={loadContent}>
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
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-base-content/70">Manage all content items across platforms</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link href="/admin/content/new" className="btn btn-primary">
            <Plus size={16} />
            Add New Content
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Content</div>
          <div className="stat-value text-primary">{contentItems.length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Published</div>
          <div className="stat-value text-success">
            {contentItems.filter(item => item.status === 'published').length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">In Draft</div>
          <div className="stat-value text-warning">
            {contentItems.filter(item => item.status === 'draft').length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Views</div>
          <div className="stat-value">
            {formatNumber(contentItems.reduce((sum, item) => sum + item.views, 0))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Search content..." 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            className="select select-bordered" 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="gallery">Gallery</option>
            <option value="event">Event</option>
          </select>
          <select 
            className="select select-bordered" 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="review">In Review</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      <div className="card bg-base-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('title')}>
                    Title
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th>Type</th>
                <th>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('created_at')}>
                    Date
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th>Author</th>
                <th>Status</th>
                <th>Platforms</th>
                <th>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('views')}>
                    Views
                    {sortField === 'views' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <tr key={item.id}>
                    <td className="min-w-[200px]">
                      <div className="flex items-center space-x-2">
                        <div className="bg-base-200 p-2 rounded">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <span className="font-medium">{item.title}</span>
                          {item.description && (
                            <p className="text-xs text-base-content/70 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="capitalize">{item.type}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.author_name || 'Unknown'}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {item.platforms.length > 0 ? (
                          item.platforms.slice(0, 2).map((platform) => (
                            <span key={platform.id} className="badge badge-outline badge-sm">
                              {platform.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-base-content/50 text-sm">No platforms</span>
                        )}
                        {item.platforms.length > 2 && (
                          <span className="badge badge-outline badge-sm">
                            +{item.platforms.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>{formatNumber(item.views)} views</div>
                        <div className="text-xs text-base-content/70">
                          {formatNumber(item.likes)} likes
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <a href={`/admin/content/${item.id}`}>
                              <Eye size={14} className="mr-2" /> View Details
                            </a>
                          </li>
                          <li>
                            <a href={`/admin/content/${item.id}/edit`}>
                              <Edit size={14} className="mr-2" /> Edit
                            </a>
                          </li>
                          {item.content_url && (
                            <li>
                              <a href={item.content_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} className="mr-2" /> View Content
                              </a>
                            </li>
                          )}
                          {item.status !== 'published' && (
                            <li>
                              <a onClick={() => handlePublish(item.id, item.title)}>
                                <CheckCircle size={14} className="mr-2" /> Publish
                              </a>
                            </li>
                          )}
                          <li>
                            <a 
                              className="text-error"
                              onClick={() => handleDelete(item.id, item.title)}
                            >
                              {deletingId === item.id ? (
                                <span className="loading loading-spinner loading-sm mr-2"></span>
                              ) : (
                                <Trash2 size={14} className="mr-2" />
                              )}
                              Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={48} className="opacity-20" />
                      <h3 className="font-semibold">No content found</h3>
                      <p className="text-base-content/70">
                        {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Start by creating your first piece of content'
                        }
                      </p>
                      {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && (
                        <Link href="/admin/content/new" className="btn btn-primary mt-2">
                          <Plus size={16} className="mr-2" />
                          Create Content
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-base-200 px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-base-content/70">
            Showing {filteredContent.length} of {contentItems.length} items
          </span>
          <div className="join">
            <button className="join-item btn btn-sm">«</button>
            <button className="join-item btn btn-sm btn-active">1</button>
            <button className="join-item btn btn-sm">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}