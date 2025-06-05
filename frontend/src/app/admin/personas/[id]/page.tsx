// frontend/src/app/admin/personas/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, Activity, Building2, Edit, 
  ArrowLeft, Tag, BarChart2, AlertCircle,
  FileText, TrendingUp, CheckCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { personaApi } from '@/lib/api';

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
  created_at?: string;
  updated_at?: string;
}

export default function ViewPersonaPage() {
  const params = useParams();
  const router = useRouter();
  const personaId = parseInt(params.id as string);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPersona = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await personaApi.getById(personaId);
        setPersona(response);
      } catch (error: any) {
        console.error('Error loading persona:', error);
        if (error.response?.status === 404) {
          setError('Persona not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load persona data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPersona();
  }, [personaId]);

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
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
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
              <h1 className="text-2xl font-bold">{persona.name}</h1>
              <div className="flex items-center gap-2">
                <div className={`badge ${persona.active ? 'badge-success' : 'badge-ghost'}`}>
                  {persona.active ? 'Active' : 'Inactive'}
                </div>
                {persona.company_name && (
                  <div className="badge badge-outline">{persona.company_name}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Link href={`/admin/personas/${persona.id}/edit`} className="btn btn-primary">
            <Edit size={16} />
            Edit Persona
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <FileText size={20} className="text-primary mr-2" />
              <div>
                <p className="text-sm opacity-70">Content</p>
                <p className="text-2xl font-bold">{persona.contentCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <TrendingUp size={20} className="text-success mr-2" />
              <div>
                <p className="text-sm opacity-70">Engagement Rate</p>
                <p className="text-2xl font-bold">{persona.engagementRate || '4.7%'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Tag size={20} className="text-info mr-2" />
              <div>
                <p className="text-sm opacity-70">Platforms</p>
                <p className="text-2xl font-bold">{persona.platforms.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <BarChart2 size={20} className="text-warning mr-2" />
              <div>
                <p className="text-sm opacity-70">Interests</p>
                <p className="text-2xl font-bold">{persona.interests.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persona Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Description</p>
                <p className="text-base-content/70">{persona.description}</p>
              </div>
              <div>
                <p className="font-medium">Age Range</p>
                <p className="text-base-content/70">{persona.age_range || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <div className={`badge ${persona.active ? 'badge-success' : 'badge-ghost'}`}>
                  {persona.active ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1" />
                      Inactive
                    </>
                  )}
                </div>
              </div>
              {persona.company_name && (
                <div>
                  <p className="font-medium">Company</p>
                  <div className="flex items-center">
                    <Building2 size={14} className="mr-1 text-primary" />
                    <span>{persona.company_name}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="font-medium">Created</p>
                <p className="text-base-content/70">{formatDateTime(persona.created_at)}</p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-base-content/70">{formatDateTime(persona.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platforms and Interests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platforms */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Target Platforms ({persona.platforms.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {persona.platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center p-3 bg-base-200 rounded-lg">
                    <Activity size={16} className="mr-2 text-primary" />
                    <span className="font-medium">{platform.name}</span>
                  </div>
                ))}
              </div>
              {persona.platforms.length === 0 && (
                <div className="text-center py-8 text-base-content/50">
                  No platforms configured
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Key Interests ({persona.interests.length})</h2>
              <div className="flex flex-wrap gap-2">
                {persona.interests.map((interest) => (
                  <div key={interest.id} className="badge badge-primary badge-lg gap-2">
                    <Tag size={12} />
                    {interest.name}
                  </div>
                ))}
              </div>
              {persona.interests.length === 0 && (
                <div className="text-center py-8 text-base-content/50">
                  No interests configured
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">Content Performance</h2>
            <Link href={`/admin/content?persona=${persona.id}`} className="btn btn-outline btn-sm">
              View All Content
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-title">Total Content</div>
              <div className="stat-value text-primary">{persona.contentCount}</div>
              <div className="stat-desc">pieces of content</div>
            </div>
            <div className="stat">
              <div className="stat-title">Avg. Engagement</div>
              <div className="stat-value text-success">{persona.engagementRate || '4.7%'}</div>
              <div className="stat-desc">across all platforms</div>
            </div>
            <div className="stat">
              <div className="stat-title">Platform Reach</div>
              <div className="stat-value text-info">{persona.platforms.length}</div>
              <div className="stat-desc">active platforms</div>
            </div>
          </div>
          
          {persona.contentCount === 0 && (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto opacity-20 mb-4" />
              <h3 className="font-semibold mb-2">No Content Yet</h3>
              <p className="text-base-content/70 mb-4">
                Start creating content targeted to this persona
              </p>
              <Link href="/admin/content/new" className="btn btn-primary">
                Create Content
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}