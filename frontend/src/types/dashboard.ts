import { ReactNode } from 'react';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer' | 'admin' | any;
  avatar?: string;
  company_id?: number;
  company_name?: string;
  department?: string;
  companyName: string;
  status?: string;
  created_at?: string;
  last_login?: string;
}

// Feed content types
export interface Metric {
  likes: string;
  comments: string;
  shares: string;
  views?: string;
}

// in /types/dashboard.ts
export interface FeedItem {
  id: number;
  title: string;
  description: string;
  date: string;
  poster: string;           // thumbnail_url → poster
  socialLink?: string;      // keep if you need “View on Instagram/TikTok”
  videoUrl?: string;        // content_url → videoUrl  
  platforms: string[];      // was platformNames
  metrics: Metric;
}


// Personas and targeting
export interface Persona {
  id: number;
  name: string;
  description: string;
  ageRange?: string;
  interests?: string[];
  platforms?: string[];
}

export interface Insight {
    id: number;
    title: string;
    description: string;
    date: string;
    platform?: string;
    trend?: string;
    image?: string;
    actionable: boolean;
    category: 'Content' | 'Audience' | 'Engagement' | 'Conversion';
    tags?: string[];
    content?: string; // HTML content for detailed view
  }

export interface KPI {
  id: number;
  name: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  change: string;
  icon: ReactNode;
}

export interface ContentItem {
  id: number;
  title: string;
  engagement: string;
  platform: string;
  trend: string;
}

export interface ScheduledContent {
  id: number;
  title: string;
  date: Date;
  platforms: string[];
  status: 'Scheduled' | 'In Production' | 'Planning' | 'Completed';
}

// Component prop types
export interface PersonaSelectorProps {
  value: number;
  onChange: (id: number) => void;
  personas: Persona[];
  personaLoading: boolean;
  setIsManuallyHidden: (v:boolean) => void;
  className?: string;
}

export interface VideoPlayerProps {
    src?: string;
    poster?: string;
    title?: string;
    description?: string;
    metrics?: {
      likes: string;
      comments: string;
      shares: string;
    };
    socialLink?: string;
    onNext?: () => void;
    onPrevious?: () => void;
    index?: number;
    total?: number;
    date?: string;
    autoplay?: boolean;
  }

export interface InsightCardProps {
  insight: Insight;
  onClick?: (id: number) => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface KpiCardProps {
  kpi: KPI;
}

export interface TimeframeSelectorProps {
  value: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  onChange: (value: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all') => void;
}

export interface PlatformFilterProps {
  platforms: {
    [key: string]: boolean;
  };
  onChange: (platform: string) => void;
}

export interface EmbedProps {
    videoUrl: string;
  }
  
  export interface PlatformFilters {
    [key: string]: boolean;
  }
  
  export interface PlatformFilterProps {
    platforms: PlatformFilters;
    onChange: (platform: string) => void;
  }
  
  export interface PersonaSelectorProps {
    value: number;
    onChange: (value: number) => void;
  }

declare global {
    interface Window {
      tiktokEmbed?: {
        reloadEmbeds: () => void;
      };
    }
  }

  export interface InsightType {
    id: string;
    title: string;
    description: string;
    date: string;
    platform?: string;
    category?: string;
    trend?: string;
    image?: string;
    content?: string;
    actionable?: boolean;
    author?: {
      name: string;
      role?: string;
      avatar?: string;
    };
    tags?: string[];
    relatedInsights?: InsightType[];
  }

  export interface Company {
    id: number;
    name: string;
    description?: string;
    industry?: string;
    website?: string;
    logo_url?: string;
    status: 'active' | 'inactive';
    user_count: number;
    created_at: string;
    updated_at: string;
  }