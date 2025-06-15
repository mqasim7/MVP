"use client";

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Eye,
  ArrowUp, ArrowDown, MoreVertical, FileText,
  Image, Video, File, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { contentApi, personaApi } from '@/lib/api';
import { Persona } from '@/types/dashboard';
import type { FC } from 'react';
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

type ContentStatus = 'published' | 'draft' | 'scheduled' | 'review';

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
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState(0);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [personasResponse, contentResponse] = await Promise.all([
        personaApi.getAll(),
        contentApi.getAll()
      ]);
      setPersonas(personasResponse);
      setContentItems(contentResponse);
    } catch (error: any) {
      console.error('Error loading content:', error);
      setError(error.response?.data?.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = contentItems
    .filter(item => {
      const matchesPersona = selectedPersona === 0 || item.personas.some(p => p.id === selectedPersona);
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.author_name && item.author_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesPersona && matchesSearch && matchesType && matchesStatus;
    })
    .sort((a: any, b: any) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];

      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }

      if (sortDirection === 'asc') return fieldA > fieldB ? 1 : -1;
      else return fieldA < fieldB ? 1 : -1;
    });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      await contentApi.delete(id);
      await loadContent();
      alert('Content deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete content.');
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'article': return <FileText size={16} />;
      case 'gallery': return <Image size={16} />;
      default: return <File size={16} />;
    }
  };
 
  const statusConfig: Record<ContentStatus, { class: string; icon: LucideIcon }> = {
    published: { class: 'badge-success', icon: CheckCircle },
    draft: { class: 'badge-warning', icon: Edit },
    scheduled: { class: 'badge-info', icon: Clock },
    review: { class: 'badge-ghost', icon: Eye },
  };  

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as ContentStatus] || {
      class: 'badge-neutral',
      icon: File,
    };
  
    const Icon = config.icon;
    return (
      <span className={`badge ${config.class} gap-1`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
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
          <button className="btn btn-sm" onClick={loadContent}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-base-content/70">Manage content across platforms</p>
        </div>
        <Link href="/admin/content/new" className="btn btn-primary mt-4 lg:mt-0">
          <Plus size={16} /> Add New Content
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Content</div>
          <div className="stat-value text-primary">{contentItems.length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Published</div>
          <div className="stat-value text-success">{contentItems.filter(c => c.status === 'published').length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Drafts</div>
          <div className="stat-value text-warning">{contentItems.filter(c => c.status === 'draft').length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Views</div>
          <div className="stat-value">{formatNumber(contentItems.reduce((sum, c) => sum + c.views, 0))}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Search content..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="select w-64 select-bordered"
          value={selectedPersona}
          onChange={e => setSelectedPersona(Number(e.target.value))}
        >
          <option value={0}>Select Persona</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select className="select select-bordered" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="video">Video</option>
          <option value="article">Article</option>
          <option value="gallery">Gallery</option>
          <option value="event">Event</option>
        </select>
        <select className="select select-bordered" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="review">Review</option>
        </select>
      </div>

      <div className="card bg-base-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="cursor-pointer">
                  Title {sortField === 'title' && (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </th>
                <th>Type</th>
                <th onClick={() => handleSort('created_at')} className="cursor-pointer">
                  Date {sortField === 'created_at' && (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </th>
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.length > 0 ? filteredContent.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="bg-base-200 p-1 rounded">{getTypeIcon(item.type)}</div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && <p className="text-xs text-base-content/70">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td>{item.type}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>{item.author_name || 'Unknown'}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{formatNumber(item.views)}</td>
                  <td>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-sm">
                        <MoreVertical size={16} />
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a href={`/admin/content/${item.id}`}><Eye size={14} /> View</a></li>
                        <li><a href={`/admin/content/${item.id}/edit`}><Edit size={14} /> Edit</a></li>
                        <li><a onClick={() => handleDelete(item.id, item.title)} className="text-error">
                          {deletingId === item.id ? <span className="loading loading-spinner loading-sm" /> : <Trash2 size={14} />} Delete
                        </a></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">No content found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
