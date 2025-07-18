"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, BarChart2, ArrowUpRight, 
  ThumbsUp, Eye, MessageSquare, Calendar, AlertTriangle,
  CheckCircle, Clock, Activity,
  Plus,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { companyApi } from '@/lib/api';
import { Company } from '@/types/dashboard';

export default function AdminDashboard() {
  // Mock data for admin dashboard
  const stats = [
    { id: 1, title: 'Total Content', value: '142', icon: <FileText size={20} />, change: '+12%', color: 'primary' },
    { id: 2, title: 'Active Users', value: '28', icon: <Users size={20} />, change: '+5%', color: 'secondary' },
    { id: 3, title: 'Personas', value: '6', icon: <Users size={20} />, change: '+2', color: 'accent' },
    { id: 4, title: 'Total Views', value: '24.5k', icon: <Eye size={20} />, change: '+18%', color: 'info' },
  ];

  const [companies, setCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
      loadCompanies();
    }, []);
  
    const loadCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await companyApi.getAll();
        setCompanies(response);
      } catch (error: any) {
        console.error('Error loading companies:', error);
        setError(error.response?.data?.message || 'Failed to load companies');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-base-content/70">Manage content, personas, and users</p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <Link href="/admin/companies/new" className="btn btn-primary">
            <Plus size={16} />
            New Company
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
        {/* <div className="card bg-base-100 shadow-xl">
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
        </div> */}

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
                    <div className="font-medium"><Link href={`/admin/companies/${company.id}`}>{company.name}</Link></div>
                    {/* <div className="text-sm opacity-70">{company.users} users</div> */}
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      company.status === 'active' ? 'badge-success' : 'badge-ghost'
                    }`}>
                      {company.status}
                    </div>
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
      {/* <div className="card bg-base-100 shadow-xl">
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
        </div> */}
    </div>
  );
}

