import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, TrendingUp, CheckCircle, Share2, Bookmark } from 'lucide-react';
import { InsightType } from '@/types/dashboard';

interface InsightDetailViewProps {
  insight?: InsightType;
  insightId?: string;
  onBackClick?: () => void;
}

const InsightDetailView: React.FC<InsightDetailViewProps> = ({ 
  insight, 
  insightId,
  onBackClick 
}) => {
  const router = useRouter();
  const [insightData, setInsightData] = React.useState<InsightType | null>(null);
  const [loading, setLoading] = React.useState(!insight);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If insight is directly provided, use it
    if (insight) {
      setInsightData(insight);
      setLoading(false);
      return;
    }

    // Otherwise, fetch the insight using the ID from props or URL
    const id = insightId || router.query.id as string;
    
    if (id) {
      fetchInsight(id);
    }
  }, [insight, insightId, router.query.id]);

  const fetchInsight = async (id: string) => {
    try {
      setLoading(true);
      // Replace this with your actual API call
      const response = await fetch(`/api/insights/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch insight data');
      }
      
      const data = await response.json();
      setInsightData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching insight:', err);
      setError('Unable to load this insight. Please try again later.');
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleShare = () => {
    // Implement sharing functionality
    if (navigator.share && insightData) {
      navigator.share({
        title: insightData.title,
        text: insightData.description,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const handleBookmark = () => {
    // Implement bookmarking functionality
    console.log('Bookmark clicked');
  };

  const handleTakeAction = () => {
    // Implement action functionality
    console.log('Take action clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !insightData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-error text-xl mb-4">
          {error || 'Insight not found'}
        </div>
        <button 
          onClick={handleBackClick}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    title,
    description,
    content,
    date,
    platform,
    category,
    trend,
    image,
    actionable,
    author,
    relatedInsights,
    tags
  } = insightData;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={handleBackClick}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft size={20} />
            <span className="ml-1">Back</span>
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleShare}
              className="btn btn-ghost btn-sm"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={handleBookmark}
              className="btn btn-ghost btn-sm"
              aria-label="Bookmark"
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero section */}
        <div className="mb-8">
          {image && (
            <div className="rounded-lg overflow-hidden h-64 md:h-96 mb-6">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-gray-500" />
              <span>{date}</span>
            </div>
            
            {platform && (
              <div className="badge badge-primary">{platform}</div>
            )}
            
            {category && !platform && (
              <div className="badge badge-secondary">{category}</div>
            )}
            
            {trend && (
              <div className="flex items-center text-success">
                <TrendingUp size={16} className="mr-1" />
                <span className="font-medium">{trend}</span>
              </div>
            )}
          </div>
          
          {author && (
            <div className="flex items-center mb-6">
              <div className="avatar mr-3">
                <div className="w-10 h-10 rounded-full">
                  <img src={author.avatar || "/api/placeholder/40/40"} alt={author.name} />
                </div>
              </div>
              <div>
                <div className="font-medium">{author.name}</div>
                <div className="text-sm opacity-70">{author.role}</div>
              </div>
            </div>
          )}
          
          <p className="text-lg font-medium text-gray-700 mb-6">{description}</p>
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag: string, index: number) => (
              <div key={index} className="badge badge-outline">
                {tag}
              </div>
            ))}
          </div>
        )}
        
        {/* Main content */}
        <div className="prose max-w-none mb-12">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>No content available for this insight.</p>
          )}
        </div>
        
        {/* Actionable section */}
        {actionable && (
          <div className="mb-12 p-6 bg-success bg-opacity-10 rounded-lg border border-success">
            <div className="flex items-center text-success font-medium mb-3">
              <CheckCircle size={20} className="mr-2" />
              <span className="text-lg">Actionable Insight</span>
            </div>
            <p className="mb-4">This insight contains actionable recommendations that you can implement to improve your performance or results.</p>
            <button 
              onClick={handleTakeAction}
              className="btn btn-success"
            >
              Take Action
            </button>
          </div>
        )}
        
        {/* Related insights */}
        {relatedInsights && relatedInsights.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedInsights.map((related: any) => (
                <div key={related.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                  {related.image && (
                    <figure>
                      <img 
                        src={related.image} 
                        alt={related.title}
                        className="h-32 w-full object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body p-4">
                    <h3 className="card-title text-base">{related.title}</h3>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span>{related.date}</span>
                      {related.platform && (
                        <div className="badge badge-sm">{related.platform}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightDetailView;