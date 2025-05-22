import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Lululemon Dashboard',
  description: 'Login to access the Lululemon marketing insights dashboard',
};

export default function LoginPage() {
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