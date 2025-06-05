"use client";

import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, 
  ArrowUp, ArrowDown, MoreVertical, FileText, 
  Image, Video, File
} from 'lucide-react';
import Link from 'next/link';

export default function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Mock content data
  const contentItems = [
    { 
      id: 1, 
      title: 'Summer Collection Preview', 
      type: 'video', 
      date: '2025-05-18', 
      author: 'Marketing Team',
      status: 'published',
      platform: ['Instagram', 'TikTok'],
      views: 12400,
      likes: 3200
    },
    { 
      id: 2, 
      title: 'Mindfulness Practice Series', 
      type: 'article', 
      date: '2025-05-20', 
      author: 'Wellness Team',
      status: 'draft',
      platform: ['Website', 'Instagram'],
      views: 0,
      likes: 0
    },
    { 
      id: 3, 
      title: 'Community Spotlight: Outdoor Yoga', 
      type: 'gallery', 
      date: '2025-05-23', 
      author: 'Community Team',
      status: 'scheduled',
      platform: ['All Platforms'],
      views: 0,
      likes: 0
    },
    { 
      id: 4, 
      title: 'Product Launch: New Align Collection', 
      type: 'video', 
      date: '2025-05-25', 
      author: 'Product Team',
      status: 'review',
      platform: ['Website', 'YouTube'],
      views: 450,
      likes: 120
    },
    { 
      id: 5, 
      title: 'Sustainability Initiatives 2025', 
      type: 'article', 
      date: '2025-05-15', 
      author: 'Corporate Team',
      status: 'published',
      platform: ['Website', 'Email'],
      views: 8900,
      likes: 1500
    },
    { 
      id: 6, 
      title: 'Workout Routine: 30-Day Challenge', 
      type: 'video', 
      date: '2025-05-10', 
      author: 'Fitness Team',
      status: 'published',
      platform: ['Instagram', 'YouTube'],
      views: 15600,
      likes: 4200
    },
    { 
      id: 7, 
      title: 'Fabric Technology: Innovation Spotlight', 
      type: 'article', 
      date: '2025-05-05', 
      author: 'Research Team',
      status: 'published',
      platform: ['Website', 'LinkedIn'],
      views: 6300,
      likes: 980
    },
    { 
      id: 8, 
      title: 'Store Opening: New York SoHo', 
      type: 'event', 
      date: '2025-06-01', 
      author: 'Retail Team',
      status: 'scheduled',
      platform: ['All Platforms'],
      views: 0,
      likes: 0
    },
  ];

  // Filter and sort content
  const filteredContent = contentItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a:any, b:any) => {
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
  const handleSort = (field:any) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Content type icon
  const getTypeIcon = (type:any) => {
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
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('date')}>
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th>Author</th>
                <th>Status</th>
                <th>Platform</th>
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
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </td>
                    <td className="capitalize">{item.type}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.author}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'published' ? 'badge-success' :
                        item.status === 'draft' ? 'badge-warning' :
                        item.status === 'scheduled' ? 'badge-info' :
                        'badge-ghost'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {item.platform.map((p, i) => (
                          <span key={i} className="badge badge-outline badge-sm">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td>{item.views.toLocaleString()}</td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a><Eye size={14} className="mr-2" /> Preview</a></li>
                          <li><a><Edit size={14} className="mr-2" /> Edit</a></li>
                          <li><a className="text-error"><Trash2 size={14} className="mr-2" /> Delete</a></li>
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
                      <p className="text-base-content/70">Try adjusting your search or filters</p>
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
            <button className="join-item btn btn-sm">1</button>
            <button className="join-item btn btn-sm btn-active">2</button>
            <button className="join-item btn btn-sm">3</button>
            <button className="join-item btn btn-sm">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}