import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, FileText } from 'lucide-react';

interface ContentItem {
  id: number;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'gallery' | 'event';
  status: 'published' | 'draft' | 'scheduled' | 'review';
  created_at: string;
  author_name?: string;
}

interface Props {
  contentItems: ContentItem[];
  companyId: number;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export default function CompanyContentTable({ contentItems, companyId }: Props) {
  const [contentPage, setContentPage] = useState(1);
  const [contentPageSize] = useState(5);
  const paginatedContent = contentItems.slice((contentPage - 1) * contentPageSize, contentPage * contentPageSize);
  const totalContentPages = Math.ceil(contentItems.length / contentPageSize);

  return (
    <div className="card bg-base-100 shadow-xl mt-6">
      <div className="card-body">
        <div className="flex flex-col lg:flex-row justify-between mb-8">
          <div>
            <h2 className="card-title mb-4">Company Content List</h2>
          </div>
          <Link href={`/admin/content/new?companyId=${companyId}`} className="btn btn-primary mt-4 lg:mt-0">
            <Plus size={16} /> Add New Content
          </Link>
        </div>
        {paginatedContent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContent.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td className="capitalize">{item.type}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'published' ? 'badge-success' :
                        item.status === 'draft' ? 'badge-warning' :
                        item.status === 'scheduled' ? 'badge-info' :
                        'badge-ghost'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.author_name || 'Unknown'}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <Link href={`/admin/content/${item.id}?companyId=${companyId}`} className="btn btn-sm btn-ghost">
                        <Eye size={14} className="mr-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto opacity-20 mb-4" />
            <h3 className="font-semibold mb-2">No content available</h3>
            <p className="text-base-content/70">This company hasn't created any content yet.</p>
          </div>
        )}
        {contentItems.length > contentPageSize && (
          <div className="flex justify-center mt-4 gap-2">
            <button className="btn btn-sm" onClick={() => setContentPage(p => Math.max(1, p - 1))} disabled={contentPage === 1}>Previous</button>
            {Array.from({ length: totalContentPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${contentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setContentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-sm" onClick={() => setContentPage(p => Math.min(totalContentPages, p + 1))} disabled={contentPage === totalContentPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
} 