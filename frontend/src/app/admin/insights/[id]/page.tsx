// frontend/src/app/admin/insights/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, Edit, ArrowLeft, Eye, Calendar, 
  BarChart2, Users, CheckCircle, Clock, Tag,
  AlertCircle, TrendingUp, User, Building2,
  ExternalLink, Share2, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { insightsApi } from '@/lib/api';
import DOMPurify from 'dompurify';

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

export default function ViewInsightPage() {
  const params = useParams();
  const router = useRouter();
  const insightId = parseInt(params.id as string);

  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsight = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await insightsApi.getById(insightId);
        setInsight(response);
      } catch (error: any) {
        console.error('Error loading insight:', error);
        if (error.response?.status === 404) {
          setError('Insight not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load insight data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInsight();
  }, [insightId]);

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      Content: { class: 'badge-primary', icon: FileText },
      Audience: { class: 'badge-secondary', icon: Users },
      Engagement: { class: 'badge-info', icon: BarChart2 },
      Conversion: { class: 'badge-success', icon: TrendingUp }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.Content;
    const Icon = config.icon;
    
    return (
      <div className={`badge ${config.class} gap-2 p-3`}>
        <Icon size={14} />
        {category}
      </div>
    );
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Unknown';
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFullDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Unknown';
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createSafeContent = (htmlContent: string) => {
    return {
      __html: DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'blockquote'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      })
    };
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
            <Link href="/admin/insights" className="btn btn-ghost">
              Back to Insights
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Insight Not Found</h1>
          <Link href="/admin/insights" className="btn btn-primary">
            Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/admin/insights" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft size={16} />
            Back to Insights
          </Link>
          <div className="flex items-center">
            <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{insight.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getCategoryBadge(insight.category)}
                {insight.actionable && (
                  <div className="badge badge-success gap-2">
                    <CheckCircle size={12} />
                    Actionable
                  </div>
                )}
                {insight.company_name && (
                  <div className="badge badge-outline">{insight.company_name}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Link href={`/admin/insights/${insight.id}/edit`} className="btn btn-primary">
            <Edit size={16} />
            Edit Insight
          </Link>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: insight.title,
                  text: insight.description,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="btn btn-outline"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Calendar size={20} className="text-primary mr-2" />
              <div>
                <p className="text-sm opacity-70">Published</p>
                <p className="text-lg font-bold">{formatDateTime(insight.date)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <Tag size={20} className="text-info mr-2" />
              <div>
                <p className="text-sm opacity-70">Category</p>
                <p className="text-lg font-bold">{insight.category}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <BarChart2 size={20} className="text-success mr-2" />
              <div>
                <p className="text-sm opacity-70">Platform</p>
                <p className="text-lg font-bold">{insight.platform || 'All Platforms'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-warning mr-2" />
              <div>
                <p className="text-sm opacity-70">Type</p>
                <p className="text-lg font-bold">{insight.actionable ? 'Actionable' : 'Informational'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Header Image */}
      {insight.image_url && (
        <div className="card bg-base-100 shadow mb-8">
          <div className="card-body">
            <div className="relative max-w-3xl mx-auto">
              <img 
                src={insight.image_url} 
                alt={insight.title}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Insight Content */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="card-title text-2xl">Insight Details</h2>
                {insight.trend && (
                  <div className="flex items-center gap-2 text-success">
                    <TrendingUp size={16} />
                    <span className="font-medium">{insight.trend}</span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <p className="text-base-content/80 leading-relaxed">{insight.description}</p>
              </div>

              {/* Full Content */}
              {insight.content && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Full Analysis</h3>
                  <div 
                    className="prose prose-sm max-w-none text-base-content/90"
                    dangerouslySetInnerHTML={createSafeContent(insight.content)}
                  />
                </div>
              )}

              {/* Tags */}
              {insight.tags && insight.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {insight.tags.map((tag, index) => (
                      <div key={index} className="badge badge-primary badge-outline gap-2">
                        <Tag size={12} />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action for Actionable Insights */}
              {insight.actionable && (
                <div className="alert alert-info mt-6">
                  <CheckCircle size={20} />
                  <div>
                    <h4 className="font-bold">Actionable Insight</h4>
                    <p className="text-sm">This insight contains specific recommendations that can be implemented to improve performance.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Insight Metadata */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Insight Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Category</p>
                  {getCategoryBadge(insight.category)}
                </div>
                
                <div>
                  <p className="font-medium">Published Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    <span className="text-sm">{formatDateTime(insight.date)}</span>
                  </div>
                </div>

                {insight.platform && (
                  <div>
                    <p className="font-medium">Platform</p>
                    <div className="flex items-center gap-2">
                      <BarChart2 size={14} className="text-primary" />
                      <span className="text-sm">{insight.platform}</span>
                    </div>
                  </div>
                )}

                {insight.author_name && (
                  <div>
                    <p className="font-medium">Author</p>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-primary" />
                      <span className="text-sm">{insight.author_name}</span>
                    </div>
                  </div>
                )}

                {insight.company_name && (
                  <div>
                    <p className="font-medium">Company</p>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-primary" />
                      <span className="text-sm">{insight.company_name}</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-medium">Type</p>
                  <div className={`badge ${insight.actionable ? 'badge-success' : 'badge-ghost'} gap-2`}>
                    {insight.actionable ? (
                      <>
                        <CheckCircle size={12} />
                        Actionable
                      </>
                    ) : (
                      <>
                        <Eye size={12} />
                        Informational
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-base-content/70">{formatFullDateTime(insight.created_at)}</p>
                </div>

                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-base-content/70">{formatFullDateTime(insight.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Actions</h3>
              <div className="space-y-3">
                <Link 
                  href={`/admin/insights/${insight.id}/edit`} 
                  className="btn btn-outline btn-sm w-full"
                >
                  <Edit size={16} />
                  Edit Insight
                </Link>
                
                <button 
                  onClick={() => {
                    const text = `${insight.title}\n\n${insight.description}\n\n${window.location.href}`;
                    navigator.clipboard.writeText(text);
                    alert('Insight details copied to clipboard!');
                  }}
                  className="btn btn-ghost btn-sm w-full"
                >
                  <ExternalLink size={16} />
                  Copy Details
                </button>

                <Link 
                  href="/admin/insights/new" 
                  className="btn btn-ghost btn-sm w-full"
                >
                  <BookOpen size={16} />
                  Create Similar
                </Link>
              </div>
            </div>
          </div>

          {/* Performance Indicator */}
          {insight.trend && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Performance Trend</h3>
                <div className="flex items-center justify-center p-4 bg-success/10 rounded-lg">
                  <TrendingUp size={24} className="text-success mr-2" />
                  <span className="text-success font-semibold">{insight.trend}</span>
                </div>
                <p className="text-sm text-base-content/70 mt-2 text-center">
                  Based on latest data analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}