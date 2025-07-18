'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Rate limiting check
      const clientId = 'admin-login'; // In production, use IP address
      
      // Simple authentication (in a real app, this would be server-side)
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        // Generate session token
        const sessionToken = Math.random().toString(36).substr(2, 9);
        
        // Set session in localStorage and cookie (in a real app, use proper session management)
        localStorage.setItem('adminSession', sessionToken);
        document.cookie = `adminSession=${sessionToken}; path=/; max-age=86400; secure; samesite=strict`;
        
        router.push('/admin/dashboard');
      } else {
        setError('Emri i përdoruesit ose fjalëkalimi është i gabuar');
        
        // Clear any existing session
        localStorage.removeItem('adminSession');
        document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ka ndodhur një gabim gjatë kyçjes. Ju lutem provoni përsëri.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            🏠 Pasuritë e Tiranës
          </h1>
          <h2 className="text-2xl font-bold text-gray-900">
            Hyrje për Agjentë
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hyni në panelin tuaj të administrimit
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Emri i Përdoruesit
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Shkruani emrin tuaj"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Fjalëkalimi
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Shkruani fjalëkalimin tuaj"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Duke u kyçur...' : 'Kyçu'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ose</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                ← Kthehu në faqen kryesore
              </Link>
            </div>
          </div>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Të dhëna për testim:
            </h3>
            <div className="text-sm text-blue-700">
              <p><strong>Përdoruesi:</strong> admin</p>
              <p><strong>Fjalëkalimi:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}