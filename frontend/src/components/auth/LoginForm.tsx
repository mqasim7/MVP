'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Blur the active element to close the keyboard and reset zoom
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black border border-[#2A2A2A] text-white rounded-lg overflow-hidden shadow-xl">
      {/* Header Section */}
      {/* <div className="relative px-8 pt-10 pb-8 text-center border-b border-[#2A2A2A]">
        <h1 className="text-3xl font-bold tracking-wider text-[#EFFF00]">SIGN IN</h1>
      </div> */}

      {/* Form Section */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-white px-4 py-3 rounded-md text-sm mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium tracking-wide uppercase">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                className="block w-full pl-10 pr-3 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md focus:ring-1 focus:ring-[#EFFF00] focus:border-[#EFFF00] text-white placeholder-white/40 text-base"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            {/* <div className="flex justify-between items-center">
              <label className="block text-sm font-medium tracking-wide uppercase">Password</label>
              <a href="#" className="text-xs text-[#EFFF00] hover:text-[#EFFF00]/80 underline-offset-4 hover:underline">
                Forgot password?
              </a>
            </div> */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="block w-full pl-10 pr-10 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md focus:ring-1 focus:ring-[#EFFF00] focus:border-[#EFFF00] text-white placeholder-white/40 text-base"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-white/50 hover:text-white focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 border-[#2A2A2A] rounded bg-[#1A1A1A] focus:ring-[#EFFF00] text-[#EFFF00]"
              id="remember-me"
            //   checked={rememberMe}
            //   onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
              Remember me
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#EFFF00] hover:bg-[#D6E600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EFFF00] uppercase tracking-wider transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;