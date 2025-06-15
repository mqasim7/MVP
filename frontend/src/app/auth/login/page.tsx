'use client';

import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin/companies');
      } else {
        router.push('/dashboard/feed');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-white flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* <div className="flex justify-center mb-4">
            <img 
              src="/images/logo.svg" 
              alt="Lululemon" 
              className="h-12 w-auto"
            />
          </div> */}
          <h2 className="card-title text-2xl font-bold text-black text-center justify-center mb-6">
            Sign in to your account
          </h2>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}