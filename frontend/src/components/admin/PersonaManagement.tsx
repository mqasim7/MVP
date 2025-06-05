"use client";

import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, 
  Users, Tag, BarChart2, ExternalLink, Eye,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function PersonaManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock personas data
  const personas = [
    {
      id: 1,
      name: 'Mindful Movers (Gen Z)',
      description: 'Health-conscious Gen Z focused on mindfulness and movement',
      ageRange: '18-24',
      platforms: ['Instagram', 'TikTok'],
      interests: ['Yoga', 'Mindfulness', 'Sustainability'],
      active: true,
      contentCount: 32,
      engagementRate: '4.7%'
    },
    {
      id: 2,
      name: 'Active Professionals',
      description: 'Career-focused individuals who prioritize fitness',
      ageRange: '25-34',
      platforms: ['Instagram', 'LinkedIn'],
      interests: ['Running', 'HIIT', 'Career Development'],
      active: true,
      contentCount: 28,
      engagementRate: '3.9%'
    },
    {
      id: 3,
      name: 'Outdoor Enthusiasts',
      description: 'Adventure seekers who enjoy nature and outdoor activities',
      ageRange: '25-45',
      platforms: ['Instagram', 'YouTube'],
      interests: ['Hiking', 'Trail Running', 'Camping'],
      active: true,
      contentCount: 24,
      engagementRate: '4.2%'
    },
    {
      id: 4,
      name: 'Yoga Practitioners',
      description: 'Dedicated yoga followers with focus on holistic wellness',
      ageRange: '25-55',
      platforms: ['Instagram', 'Website'],
      interests: ['Yoga', 'Meditation', 'Wellness'],
      active: true,
      contentCount: 30,
      engagementRate: '5.1%'
    },
    {
      id: 5,
      name: 'Fitness Beginners',
      description: 'Newcomers to fitness seeking accessible workouts and guidance',
      ageRange: '18-65',
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      interests: ['Beginner Workouts', 'Motivation', 'Community'],
      active: false,
      contentCount: 18,
      engagementRate: '3.4%'
    },
    {
      id: 6,
      name: 'College Athletes',
      description: 'Student athletes looking for performance gear and training tips',
      ageRange: '18-22',
      platforms: ['Instagram', 'TikTok'],
      interests: ['Sports Performance', 'Team Sports', 'Training'],
      active: false,
      contentCount: 12,
      engagementRate: '3.8%'
    }
  ];

  // Filter personas based on search and tab
  const filteredPersonas = personas
    .filter(persona => {
      const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          persona.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                       (activeTab === 'active' && persona.active) ||
                       (activeTab === 'inactive' && !persona.active);
      
      return matchesSearch && matchesTab;
    });

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

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredPersonas.length > 0 ? (
          filteredPersonas.map(persona => (
            <div key={persona.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title">{persona.name}</h2>
                  <div className={`badge ${persona.active ? 'badge-success' : 'badge-ghost'}`}>
                    {persona.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className="text-base-content/70">{persona.description}</p>
                
                <div className="divider my-2"></div>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="flex items-center">
                    <Users size={14} className="mr-2 text-primary" />
                    <span>Age: {persona.ageRange}</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart2 size={14} className="mr-2 text-primary" />
                    <span>Engagement: {persona.engagementRate}</span>
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
                    {persona.platforms.map((platform, i) => (
                      <span key={i} className="badge badge-outline">{platform}</span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Interests:</div>
                  <div className="flex flex-wrap gap-1">
                    {persona.interests.map((interest, i) => (
                      <span key={i} className="badge badge-primary badge-outline">{interest}</span>
                    ))}
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-ghost btn-sm">
                    <Eye size={16} />
                    View
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm text-error">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users size={64} className="opacity-20 mb-4" />
            <h3 className="text-lg font-semibold">No personas found</h3>
            <p className="text-base-content/70">Try adjusting your search or create a new persona</p>
          </div>
        )}
      </div>

     
    </div>
  );
}