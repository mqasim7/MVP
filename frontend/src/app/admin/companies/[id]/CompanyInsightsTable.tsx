import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2, CheckCircle, FileText } from 'lucide-react';
import { insightsApi } from '@/lib/api';

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

interface Props {
    insights: Insight[];
    companyId: number;
    onDelete?: (id: number, title: string) => void;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export default function CompanyInsightsTable({ insights, companyId, onDelete }: Props) {
    const [insightPage, setInsightPage] = useState(1);
    const [insightPageSize] = useState(5);
    const filteredInsights = insights.filter(i => i.company_id === companyId);
    const paginatedInsights = filteredInsights.slice((insightPage - 1) * insightPageSize, insightPage * insightPageSize);
    const totalInsightPages = Math.ceil(filteredInsights.length / insightPageSize);

    // --- Company Insights Overview Section ---
    const total = filteredInsights.length;
    const actionable = filteredInsights.filter(i => i.actionable).length;
    const thisMonth = filteredInsights.filter(i => {
        const insightDate = new Date(i.date);
        const now = new Date();
        return insightDate.getMonth() === now.getMonth() && insightDate.getFullYear() === now.getFullYear();
    }).length;

    return (
        <Fragment>
            {/* Insights Overview */}
            <div className="card bg-base-100 shadow-xl mt-10">
                <div className="card-body">
                    <h2 className="card-title">Company Content Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <p className="text-sm opacity-70">Total Insights</p>
                            <p className="text-xl font-bold">{total}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-70">Actionable</p>
                            <p className="text-xl font-bold">{actionable}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-70">This Month</p>
                            <p className="text-xl font-bold">{thisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    {/* Insights Table */}
                    <div className="flex flex-col lg:flex-row justify-between mb-8">
                        <div>
                            <h2 className="card-title mb-4">Company Insights List</h2>
                        </div>
                        <Link href={`/admin/insights/new?companyId=${companyId}`} className="btn btn-primary mt-4 lg:mt-0">
                            <Plus size={16} /> Add New Insight
                        </Link>
                    </div>
                    {paginatedInsights.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Author</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInsights.map((insight) => (
                                        <tr key={insight.id}>
                                            <td>{insight.title}</td>
                                            <td>{insight.category}</td>
                                            <td>
                                                <span className={`badge ${insight.actionable ? 'badge-success' : 'badge-ghost'}`}>
                                                    {insight.actionable ? (
                                                        <><CheckCircle size={12} className="inline mr-1" />Actionable</>
                                                    ) : 'Informational'}
                                                </span>
                                            </td>
                                            <td>{insight.author_name || 'Unknown'}</td>
                                            <td>{formatDate(insight.date)}</td>
                                            <td className="flex gap-2">
                                                <Link href={`/admin/insights/${insight.id}?companyId=${companyId}`} className="btn btn-sm btn-ghost">
                                                    <Eye size={14} className="mr-1" /> View
                                                </Link>
                                                <Link href={`/admin/insights/${insight.id}/edit?companyId=${companyId}`} className="btn btn-sm btn-ghost">
                                                    <Edit size={14} className="mr-1" /> Edit
                                                </Link>
                                                {onDelete && (
                                                    <button className="btn btn-sm btn-error btn-outline" onClick={() => onDelete(insight.id, insight.title)}>
                                                        <Trash2 size={14} className="mr-1" /> Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText size={48} className="mx-auto opacity-20 mb-4" />
                            <h3 className="font-semibold mb-2">No insights available</h3>
                            <p className="text-base-content/70">This company hasn't created any insights yet.</p>
                        </div>
                    )}
                    {filteredInsights.length > insightPageSize && (
                        <div className="flex justify-center mt-4 gap-2">
                            <button className="btn btn-sm" onClick={() => setInsightPage(p => Math.max(1, p - 1))} disabled={insightPage === 1}>Previous</button>
                            {Array.from({ length: totalInsightPages }, (_, i) => (
                                <button
                                    key={i}
                                    className={`btn btn-sm ${insightPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setInsightPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button className="btn btn-sm" onClick={() => setInsightPage(p => Math.min(totalInsightPages, p + 1))} disabled={insightPage === totalInsightPages}>Next</button>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
} 