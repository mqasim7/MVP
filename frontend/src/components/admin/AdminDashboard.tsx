"use client";

import React from 'react';
import { 
  Users, FileText, BarChart2, ArrowUpRight, 
  ThumbsUp, Eye, MessageSquare, Calendar, AlertTriangle,
  CheckCircle, Clock, Activity,
  Plus,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Mock data for admin dashboard
  const stats = [
    { id: 1, title: 'Total Content', value: '142', icon: <FileText size={20} />, change: '+12%', color: 'primary' },
    { id: 2, title: 'Active Users', value: '28', icon: <Users size={20} />, change: '+5%', color: 'secondary' },
    { id: 3, title: 'Personas', value: '6', icon: <Users size={20} />, change: '+2', color: 'accent' },
    { id: 4, title: 'Total Views', value: '24.5k', icon: <Eye size={20} />, change: '+18%', color: 'info' },
  ];

  const recentContent = [
    { id: 1, title: 'Summer Collection Preview', type: 'Video', date: 'May 18, 2025', status: 'Published' },
    { id: 2, title: 'Mindfulness Practice Series', type: 'Article', date: 'May 20, 2025', status: 'Draft' },
    { id: 3, title: 'Community Spotlight: Outdoor Yoga', type: 'Gallery', date: 'May 23, 2025', status: 'Scheduled' },
    { id: 4, title: 'Product Launch: New Align Collection', type: 'Video', date: 'May 25, 2025', status: 'In Review' },
  ];

  const recentInsights = [
    { id: 1, title: 'Gen Z Content Trends Q2 2025', category: 'Content', actionable: true, date: '2025-05-15' },
    { id: 2, title: 'Athleticwear Video Performance', category: 'Content', actionable: true, date: '2025-05-12' },
    { id: 3, title: 'Wellness Content Strategy', category: 'Audience', actionable: false, date: '2025-05-10' },
    { id: 4, title: 'Sustainability Messaging Impact', category: 'Engagement', actionable: false, date: '2025-05-07' },
  ];

  const companies = [
    { id: 1, name: 'Lululemon', users: 25, status: 'active', lastActivity: '2 hours ago' },
    { id: 2, name: 'Nike Marketing', users: 12, status: 'active', lastActivity: '3 hours ago' },
    { id: 3, name: 'Adidas Digital', users: 8, status: 'inactive', lastActivity: '2 days ago' },
    { id: 4, name: 'Under Armour', users: 15, status: 'active', lastActivity: '1 day ago' },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-base-content/70">Manage content, personas, and users</p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <Link href="/admin/content/new" className="btn btn-primary">
            <Plus size={16} />
            New Content
          </Link>
          <Link href="/admin/users/new" className="btn btn-outline">
            <Plus size={16} />
            New User
          </Link>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className={`card bg-base-100 shadow-xl border-t-4 border-${stat.color}`}>
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className={`bg-${stat.color}/10 p-3 rounded-lg`}>
                  <div className={`text-${stat.color}`}>{stat.icon}</div>
                </div>
                <div className="badge badge-ghost">{stat.change}</div>
              </div>
              <h2 className="card-title mt-2">{stat.value}</h2>
              <p className="text-base-content/70">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Recent Content</h2>
              <Link href="/admin/content" className="btn btn-ghost btn-sm">
                View All
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContent.map((content) => (
                    <tr key={content.id}>
                      <td>{content.title}</td>
                      <td>{content.type}</td>
                      <td>{content.date}</td>
                      <td>
                        <span className={`badge ${
                          content.status === 'Published' ? 'badge-success' :
                          content.status === 'Draft' ? 'badge-warning' :
                          content.status === 'Scheduled' ? 'badge-info' :
                          'badge-ghost'
                        }`}>
                          {content.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Companies</h2>
              <Link href="/admin/companies" className="btn btn-ghost btn-sm">
                View All
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm opacity-70">{company.users} users</div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      company.status === 'active' ? 'badge-success' : 'badge-ghost'
                    }`}>
                      {company.status}
                    </div>
                    <div className="text-xs opacity-70 mt-1">{company.lastActivity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/content" className="btn btn-outline btn-block">
              <FileText size={16} className="mr-2" />
              Manage Content
            </Link>
            <Link href="/admin/users" className="btn btn-outline btn-block">
              <Users size={16} className="mr-2" />
              Manage Users
            </Link>
            <Link href="/admin/analytics" className="btn btn-outline btn-block">
              <BarChart2 size={16} className="mr-2" />
              View Analytics
            </Link>
            
          </div>
        </div>
      </div> */}

      {/* Recent Insights */}
      <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Recent Insights</h2>
              <Link href="/admin/insights" className="btn btn-ghost btn-sm">
                View All
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentInsights.map((insight) => (
                <div key={insight.id} className="p-3 bg-base-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    {insight.actionable && (
                      <div className="badge badge-success badge-xs">
                        <CheckCircle size={8} className="mr-1" />
                        Actionable
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="badge badge-outline badge-xs">{insight.category}</span>
                    <span className="opacity-70">{new Date(insight.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}

