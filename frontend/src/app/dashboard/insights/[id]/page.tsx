'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InsightDetailView from '@/components/insights/InsightDetailView';
import { Insight } from '@/types/dashboard';
import { insightsApi } from '@/lib/api';

// // Mock insights data - should match the data in InsightsGrid
// const mockInsights: Insight[] = [
//   {
//     id: 1,
//     title: "Gen Z Content Trends Q2 2025",
//     description: "Analysis of top-performing content patterns across platforms",
//     date: "May 15, 2025",
//     platform: "Cross-platform",
//     trend: "+27% engagement vs. Q1",
//     actionable: true,
//     category: 'Content',
//     content: `
//       <h2>Introduction</h2>
//       <p>Gen Z continues to drive significant shifts in content consumption and engagement patterns across digital platforms. This quarter, we've seen a marked increase in engagement rates, with several key trends emerging that brands should leverage for maximum reach and impact.</p>
      
//       <h2>Key Findings</h2>
//       <p>Our analysis across TikTok, Instagram, and YouTube revealed the following trends:</p>
//       <ul>
//         <li><strong>Short-form authenticity wins:</strong> Unpolished, authentic content outperforms highly produced videos by an average of 3.2x in engagement rate</li>
//         <li><strong>Sustainability messaging resonates:</strong> Content featuring eco-conscious themes saw 27% higher share rates</li>
//         <li><strong>Community interaction drives loyalty:</strong> Brands responding to comments within 24 hours saw 41% higher return engagement</li>
//       </ul>
      
//       <h2>Platform-Specific Insights</h2>
//       <p>Different platforms showed varying content preferences:</p>
//       <ul>
//         <li><strong>TikTok:</strong> Trend participation and duets drove the highest growth</li>
//         <li><strong>Instagram:</strong> Carousel posts with user-generated content outperformed single images</li>
//         <li><strong>YouTube:</strong> Tutorial and how-to content remains strong, with watch time increasing 18%</li>
//       </ul>
      
//       <h2>Recommendations</h2>
//       <p>Based on these findings, we recommend:</p>
//       <ol>
//         <li>Increasing creator collaborations with authentic voices in your niche</li>
//         <li>Developing platform-specific content strategies rather than cross-posting</li>
//         <li>Allocating resources to community management for rapid response</li>
//         <li>Highlighting sustainability initiatives in creative ways</li>
//       </ol>
//     `
//   },
//   {
//     id: 2,
//     title: "Athleticwear Video Performance",
//     description: "How video product demos are outperforming static images",
//     date: "May 12, 2025",
//     platform: "Instagram",
//     trend: "+45% view completion rate",
//     actionable: true,
//     category: 'Content',
//     content: `
//       <h2>Introduction</h2>
//       <p>Video content featuring athletic wear in motion is dramatically outperforming static imagery across all platforms. This insight explores the data behind this trend and provides actionable recommendations.</p>
      
//       <h2>Performance Metrics</h2>
//       <p>When comparing static product images to video demonstrations:</p>
//       <ul>
//         <li>Video content receives 45% higher view completion rates</li>
//         <li>Engagement (likes, comments, shares) increases by 78% with video</li>
//         <li>Click-through rates to product pages are 3.2x higher from video content</li>
//         <li>Conversion rates from video-driven traffic are 1.8x higher</li>
//       </ul>
      
//       <h2>Content Analysis</h2>
//       <p>The most effective athletic wear videos share these characteristics:</p>
//       <ul>
//         <li>Demonstrate the product in realistic motion (running, stretching, etc.)</li>
//         <li>Highlight specific features during movement (no slip waistbands, etc.)</li>
//         <li>Show diverse body types using the products</li>
//         <li>Include authentic testimonials during usage</li>
//       </ul>
      
//       <h2>Implementation Strategy</h2>
//       <p>To capitalize on this trend, consider implementing:</p>
//       <ol>
//         <li>360° video product views for e-commerce pages</li>
//         <li>Short-form product demos highlighting key features</li>
//         <li>User-generated content campaigns showcasing real usage</li>
//         <li>Side-by-side comparison videos showing performance benefits</li>
//       </ol>
//     `
//   },
//   {
//     id: 3,
//     title: "Wellness Content Strategy",
//     description: "Mindfulness content resonating with core audience segments",
//     date: "May 10, 2025",
//     platform: "TikTok",
//     trend: "+38% follower growth",
//     actionable: false,
//     category: 'Audience',
//     content: `
//       <h2>Wellness Trend Analysis</h2>
//       <p>Mindfulness-focused content is driving exceptional engagement and follower growth across platforms, particularly on TikTok where we've seen a 38% increase in follower acquisition from wellness-themed content.</p>
      
//       <h2>Content Themes</h2>
//       <p>The most successful wellness content falls into these categories:</p>
//       <ul>
//         <li><strong>Quick meditation breaks</strong> (60-90 second guided sessions)</li>
//         <li><strong>Mindful movement routines</strong> combining yoga and athletic wear</li>
//         <li><strong>Mental health check-ins</strong> with actionable self-care tips</li>
//         <li><strong>Nature-integrated practices</strong> showcasing outdoor activities</li>
//       </ul>
      
//       <h2>Audience Insights</h2>
//       <p>This content is particularly resonating with:</p>
//       <ul>
//         <li>Urban professionals ages 25-40 (primary engagement group)</li>
//         <li>Gen Z students seeking stress management solutions</li>
//         <li>Fitness enthusiasts expanding into holistic wellness</li>
//       </ul>
      
//       <h2>Long-term Strategy</h2>
//       <p>To maintain momentum in this space:</p>
//       <ol>
//         <li>Partner with credentialed wellness experts for content credibility</li>
//         <li>Develop a branded meditation series featuring your products</li>
//         <li>Create community challenges around mindfulness practices</li>
//         <li>Integrate product functionality with wellness benefits messaging</li>
//       </ol>
//     `
//   },
//   {
//     id: 4,
//     title: "Sustainability Messaging Impact",
//     description: "How eco-conscious content is driving brand perception",
//     date: "May 7, 2025",
//     platform: "Cross-platform",
//     trend: "+19% positive sentiment",
//     actionable: false,
//     category: 'Engagement',
//     content: `
//       <h2>Sustainability Content Performance</h2>
//       <p>Content highlighting environmental initiatives and sustainable practices is generating significantly increased positive sentiment and brand affinity, with a 19% increase in positive engagement across platforms.</p>
      
//       <h2>Key Metrics</h2>
//       <ul>
//         <li>19% increase in positive sentiment scores</li>
//         <li>32% higher share rates on sustainability-focused content</li>
//         <li>2.7x more user-generated content mentioning brand sustainability</li>
//         <li>41% increase in comments expressing brand loyalty due to values alignment</li>
//       </ul>
      
//       <h2>Message Effectiveness</h2>
//       <p>The most impactful sustainability content:</p>
//       <ul>
//         <li>Focuses on specific, measurable environmental impacts</li>
//         <li>Shows behind-the-scenes of sustainable practices</li>
//         <li>Educates on materials science and innovations</li>
//         <li>Invites consumer participation in sustainability initiatives</li>
//       </ul>
      
//       <h2>Brand Perception Shift</h2>
//       <p>Sentiment analysis reveals these changes in brand perception:</p>
//       <ul>
//         <li>Increased association with innovation and forward-thinking</li>
//         <li>Stronger emotional connection with environmentally-conscious segments</li>
//         <li>More frequent mentions as a leader in corporate responsibility</li>
//         <li>Higher trust scores among Gen Z and Millennial demographics</li>
//       </ul>
//     `
//   },
//   {
//     id: 5,
//     title: "Competitor Analysis: Activewear Brands",
//     description: "Benchmarking content strategy against key competitors",
//     date: "May 5, 2025",
//     platform: "Cross-platform",
//     trend: '',
//     actionable: true,
//     category: 'Content',
//     content: `
//       <h2>Competitive Landscape Overview</h2>
//       <p>This analysis benchmarks our content performance against five key competitors in the activewear space, identifying opportunities and threats in the current market.</p>
      
//       <h2>Content Volume & Frequency</h2>
//       <p>Compared to competitors:</p>
//       <ul>
//         <li>We publish 30% less frequently than the category leader</li>
//         <li>Our Instagram content volume is competitive (12 posts weekly vs. average 11)</li>
//         <li>TikTok presence is significantly lower (3 weekly vs. competitor average of 7)</li>
//         <li>YouTube long-form content is stronger than 80% of competitors</li>
//       </ul>
      
//       <h2>Engagement Benchmarking</h2>
//       <p>Per-post performance metrics:</p>
//       <ul>
//         <li>Instagram: 12% above category average engagement rate</li>
//         <li>TikTok: 8% below category average engagement rate</li>
//         <li>YouTube: 23% above category average watch time</li>
//         <li>Overall sentiment score ranks 2nd among competitors</li>
//       </ul>
      
//       <h2>Content Gaps & Opportunities</h2>
//       <ul>
//         <li>Competitor A dominates in athlete collaboration content</li>
//         <li>Competitor B leads in user-generated content integration</li>
//         <li>Competitor C excels in technical product explanation videos</li>
//         <li>All competitors are underutilizing sustainability messaging</li>
//       </ul>
      
//       <h2>Strategic Recommendations</h2>
//       <ol>
//         <li>Increase TikTok publishing frequency by minimum 100%</li>
//         <li>Develop technical product series highlighting innovation</li>
//         <li>Expand athlete partnership program to match Competitor A</li>
//         <li>Leverage our sustainability advantage with dedicated content series</li>
//       </ol>
//     `
//   },
//   {
//     id: 6,
//     title: "Product Launch Performance",
//     description: "Metrics and insights from recent product campaigns",
//     date: "May 3, 2025",
//     platform: "Instagram",
//     trend: "+31% conversion rate",
//     actionable: true,
//     category: 'Conversion',
//     content: `
//       <h2>Launch Campaign Results</h2>
//       <p>Our recent spring collection launch achieved exceptional results, with a 31% increase in conversion rate compared to previous launches. This analysis examines the factors driving this success.</p>
      
//       <h2>Performance Metrics</h2>
//       <ul>
//         <li>31% higher conversion rate vs. previous launch</li>
//         <li>42% increase in social traffic to product pages</li>
//         <li>Average engagement rate of 5.7% (industry average: 2.1%)</li>
//         <li>72% of sales came directly from social media touchpoints</li>
//       </ul>
      
//       <h2>Successful Tactics</h2>
//       <p>The following elements contributed most significantly to performance:</p>
//       <ul>
//         <li>Pre-launch teaser campaign (generated 45k email signups)</li>
//         <li>Influencer early access program (18 partners, 3.2M collective reach)</li>
//         <li>360° product videos with feature callouts</li>
//         <li>Limited-time launch incentives with clear urgency messaging</li>
//       </ul>
      
//       <h2>Platform Breakdown</h2>
//       <p>Performance by channel:</p>
//       <ul>
//         <li>Instagram drove 52% of social conversions</li>
//         <li>TikTok generated highest engagement but lower conversion rate</li>
//         <li>Email marketing produced highest ROI for direct traffic</li>
//         <li>YouTube delivered highest average order value</li>
//       </ul>
      
//       <h2>Launch Playbook Recommendations</h2>
//       <ol>
//         <li>Implement 3-week teaser campaign timeline for all launches</li>
//         <li>Expand influencer program with tiered content deliverables</li>
//         <li>Maintain platform-specific content strategy with clear CTAs</li>
//         <li>Create standardized measurement framework for launch performance</li>
//       </ol>
//     `
//   }
// ];

export default function InsightPage() {
  const params = useParams();
  const insightId = params.id as string;
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real app, you would fetch from API
    const fetchInsight = async () => {
      try {
        const data = await insightsApi.getById(Number(insightId));
        setInsight(data);
      } catch (err) {
        setError('Failed to load insight');
      } finally {
        setLoading(false);
      }
    };
    
    // Instead, we'll use mock data
    setLoading(true);
    fetchInsight();
    
  }, [insightId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error || 'Insight not found'}</span>
        </div>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  return <InsightDetailView insight={insight} />;
}