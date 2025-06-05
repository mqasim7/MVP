// src/app/admin/content/new/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function ContentCreationPage() {
  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/admin/content" className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={16} />
          Back to Content
        </Link>
        <div className="flex items-center">
          <div className="bg-primary text-primary-content p-3 rounded-full mr-4">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Content</h1>
            <p className="text-base-content/70">Add a new content to the platform</p>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Content Title</span>
              </label>
              <input type="text" placeholder="Enter title" className="input input-bordered w-full" />
            </div>
            
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Content Type</span>
              </label>
              <select className="select select-bordered w-full">
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="gallery">Gallery</option>
                <option value="event">Event</option>
              </select>
            </div>
            
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea className="textarea w-full textarea-bordered h-24" placeholder="Content description"></textarea>
            </div>
            
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Target Personas</span>
              </label>
              <select className="select select-bordered w-full" multiple>
                <option>Mindful Movers (Gen Z)</option>
                <option>Active Professionals</option>
                <option>Outdoor Enthusiasts</option>
                <option>Yoga Practitioners</option>
              </select>
              <label className="label">
                <span className="label-text-alt">Hold Ctrl/Cmd to select multiple</span>
              </label>
            </div>
            
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Content Upload</span>
              </label>
              <input type="file" className="file-input file-input-bordered w-full" />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Link href="/admin/content" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary">Create Content</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}