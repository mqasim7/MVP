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

  const alerts = [
    { id: 1, type: 'warning', message: 'Content approval pending for 3 items', time: '2 hours ago' },
    { id: 2, type: 'success', message: 'Weekly analytics report generated', time: '5 hours ago' },
    { id: 3, type: 'info', message: 'New user registered: marketing@example.com', time: '1 day ago' },
    { id: 4, type: 'error', message: 'API rate limit warning for Instagram feed', time: '2 days ago' },
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

        {/* System Alerts */}
        {/* <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">System Alerts</h2>
              <button className="btn btn-ghost btn-sm">
                Mark All Read
              </button>
            </div>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert ${
                  alert.type === 'warning' ? 'alert-warning' :
                  alert.type === 'success' ? 'alert-success' :
                  alert.type === 'info' ? 'alert-info' :
                  'alert-error'
                }`}>
                  <div>
                    {alert.type === 'warning' && <AlertTriangle size={16} />}
                    {alert.type === 'success' && <CheckCircle size={16} />}
                    {alert.type === 'info' && <Activity size={16} />}
                    {alert.type === 'error' && <AlertTriangle size={16} />}
                    <span>{alert.message}</span>
                  </div>
                  <div className="text-xs opacity-70">{alert.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-xl mb-8">
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
      </div>

      {/* Recent Activity */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">New content published: "Summer Collection Preview"</p>
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Clock size={14} />
                  <span>2 hours ago</span>
                  <span>•</span>
                  <span>by John Doe</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-secondary/10 p-2 rounded-full">
                <Users size={16} className="text-secondary" />
              </div>
              <div>
                <p className="font-medium">New user added: marketing@example.com</p>
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Clock size={14} />
                  <span>5 hours ago</span>
                  <span>•</span>
                  <span>by Admin</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-accent/10 p-2 rounded-full">
                <ThumbsUp size={16} className="text-accent" />
              </div>
              <div>
                <p className="font-medium">Content approved: "Mindfulness Practice Series"</p>
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Clock size={14} />
                  <span>1 day ago</span>
                  <span>•</span>
                  <span>by Review Team</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-info/10 p-2 rounded-full">
                <Calendar size={16} className="text-info" />
              </div>
              <div>
                <p className="font-medium">Scheduled content: "Community Spotlight: Outdoor Yoga"</p>
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Clock size={14} />
                  <span>2 days ago</span>
                  <span>•</span>
                  <span>by Content Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

