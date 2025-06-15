// frontend/src/app/admin/content/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, Edit, ArrowLeft, Eye, ExternalLink, 
  BarChart2, Users, Calendar, CheckCircle, Clock,
  AlertCircle, Play, Image, Video, File, Building2,
  TrendingUp, MessageCircle, Heart, Share2, User
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
  personas: { id: number; name: string; company_id?: number; }[];
  company_id?: number;
  company_name?: string;
}

export default function ViewContentPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = parseInt(params.id as string);
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');  

  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await contentApi.getById(contentId);
        setContent(response);
      } catch (error: any) {
        console.error('Error loading content:', error);
        if (error.response?.status === 404) {
          setError('Content not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load content data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={20} className="text-primary" />;
      case 'article':
        return <FileText size={20} className="text-primary" />;
      case 'gallery':
        return <Image size={20} className="text-primary" />;
      default:
        return <File size={20} className="text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { class: 'badge-success', icon: CheckCircle, text: 'Published' },
      draft: { class: 'badge-warning', icon: Edit, text: 'Draft' },
      scheduled: { class: 'badge-info', icon: Clock, text: 'Scheduled' },
      review: { class: 'badge-ghost', icon: Eye, text: 'In Review' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <div className={`badge ${config.class} gap-2 p-3`}>
        <Icon size={14} />
        {config.text}
      </div>
    );
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Unknown';
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const calculateEngagementRate = () => {
    if (!content || content.views === 0) return '0%';
    const engagement = content.likes + content.comments + content.shares;
    const rate = (engagement / content.views) * 100;
    return rate.toFixed(1) + '%';
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
            <Link href="/admin/content" className="btn btn-ghost">
              Back to Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <Link href="/admin/content" className="btn btn-primary">
            Back to Content
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
          <Link href={companyId ? `/admin/companies/${companyId}` :"/admin/content"} className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            {companyId ? "Back to Company" :"Back to Content"}
          </Link>
          <div className="flex items-center">
            <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
              {getTypeIcon(content.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{content.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(content.status)}
                {content.company_name && (
                  <div className="badge badge-outline">{content.company_name}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Link href={companyId ? `/admin/content/${content.id}/edit?companyId=${companyId}`  
          :`/admin/content/${content.id}/edit`} className="btn btn-primary">
            <Edit size={16} />
            Edit Content
          </Link>
          {/* {content.content_url && (
            <a 
              href={content.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <ExternalLink size={16} />
              View Content
            </a>
          )} */}
        </div>
      </div>

      {/* Thumbnail Preview */}
      {content.thumbnail_url && (
        <div className="card bg-base-100 shadow mb-6">
          <div className="card-body">
            <h3 className="card-title mb-4">Content Preview</h3>
            <div className="relative max-w-md mx-auto">
              <img 
                src={content.thumbnail_url} 
                alt={content.title}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {content.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-4">
                    <Play size={32} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Eye size={20} className="text-info mr-2" />
              <div>
                <p className="text-sm opacity-70">Views</p>
                <p className="text-2xl font-bold">{formatNumber(content.views)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Heart size={20} className="text-error mr-2" />
              <div>
                <p className="text-sm opacity-70">Likes</p>
                <p className="text-2xl font-bold">{formatNumber(content.likes)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <MessageCircle size={20} className="text-warning mr-2" />
              <div>
                <p className="text-sm opacity-70">Comments</p>
                <p className="text-2xl font-bold">{formatNumber(content.comments)}</p>
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
                <p className="text-2xl font-bold">{calculateEngagementRate()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Content Information</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Description</p>
                <p className="text-base-content/70">{content.description || 'No description provided'}</p>
              </div>
              <div>
                <p className="font-medium">Type</p>
                <div className="flex items-center gap-2">
                  {getTypeIcon(content.type)}
                  <span className="capitalize">{content.type}</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Status</p>
                {getStatusBadge(content.status)}
              </div>
              {content.author_name && (
                <div>
                  <p className="font-medium">Author</p>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    <span>{content.author_name}</span>
                  </div>
                </div>
              )}
              {content.company_name && (
                <div>
                  <p className="font-medium">Company</p>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-primary" />
                    <span>{content.company_name}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="font-medium">Created</p>
                <p className="text-base-content/70">{formatDateTime(content.created_at)}</p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-base-content/70">{formatDateTime(content.updated_at)}</p>
              </div>
              {content.scheduled_date && (
                <div>
                  <p className="font-medium">Scheduled Date</p>
                  <p className="text-base-content/70">{formatDateTime(content.scheduled_date)}</p>
                </div>
              )}
              {content.publish_date && (
                <div>
                  <p className="font-medium">Published Date</p>
                  <p className="text-base-content/70">{formatDateTime(content.publish_date)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Targeting and Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Personas */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Target Personas ({content.personas.length})</h2>
              {content.personas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {content.personas.map((persona) => (
                    <Link
                      key={persona.id}
                      href={`/admin/personas/${persona.id}`}
                      className="flex items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <Users size={16} className="mr-2 text-primary" />
                      <span className="font-medium">{persona.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  <Users size={48} className="mx-auto mb-2 opacity-20" />
                  <p>No target personas assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Platforms */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Distribution Platforms ({content.platforms.length})</h2>
              {content.platforms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {content.platforms.map((platform) => (
                    <div key={platform.id} className="badge badge-primary badge-lg gap-2">
                      <BarChart2 size={12} />
                      {platform.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  <BarChart2 size={48} className="mx-auto mb-2 opacity-20" />
                  <p>No platforms configured</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Engagement Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat">
              <div className="stat-figure text-info">
                <Eye size={24} />
              </div>
              <div className="stat-title">Total Views</div>
              <div className="stat-value text-info">{formatNumber(content.views)}</div>
              <div className="stat-desc">Unique impressions</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-error">
                <Heart size={24} />
              </div>
              <div className="stat-title">Likes</div>
              <div className="stat-value text-error">{formatNumber(content.likes)}</div>
              <div className="stat-desc">
                {content.views > 0 ? `${((content.likes / content.views) * 100).toFixed(1)}% of views` : '0% of views'}
              </div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-warning">
                <MessageCircle size={24} />
              </div>
              <div className="stat-title">Comments</div>
              <div className="stat-value text-warning">{formatNumber(content.comments)}</div>
              <div className="stat-desc">
                {content.views > 0 ? `${((content.comments / content.views) * 100).toFixed(1)}% of views` : '0% of views'}
              </div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-success">
                <Share2 size={24} />
              </div>
              <div className="stat-title">Shares</div>
              <div className="stat-value text-success">{formatNumber(content.shares)}</div>
              <div className="stat-desc">
                {content.views > 0 ? `${((content.shares / content.views) * 100).toFixed(1)}% of views` : '0% of views'}
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Overall Performance</h3>
              <p className="text-sm text-base-content/70">
                This content has an engagement rate of {calculateEngagementRate()}, 
                with {formatNumber(content.likes + content.comments + content.shares)} total interactions.
              </p>
            </div>
            <div className="text-right">
              <div className="stat-value text-primary">{calculateEngagementRate()}</div>
              <div className="stat-desc">Engagement Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}