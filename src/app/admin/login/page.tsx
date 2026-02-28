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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username, // Using username field as email
          password: credentials.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('adminSession', result.data.sessionToken);
        localStorage.setItem('userData', JSON.stringify({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
        }));

        router.push('/admin/dashboard');
      } else {
        setError('Email ose fjalëkalimi është i gabuar');

        // Clear any existing session
        localStorage.removeItem('adminSession');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ka ndodhur një gabim gjatë kyçjes. Ju lutem provoni përsëri.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 w-full">
      <div className="space-y-8 w-full" style={{ maxWidth: '448px' }}>
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            🏠 Pasuritë e Tiranës
          </h1>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Hyrje për Agjentë
          </h2>
          <p className="mt-2 text-sm text-slate-600 ">
            Hyni në panelin tuaj të administrimit
          </p>
        </div>

        <div className="card py-8 px-6 sm:px-10 border-none shadow-xl w-full">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200  text-red-700  px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="input-field"
                  placeholder="agent@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
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
                  className="input-field"
                  placeholder="Shkruani fjalëkalimin tuaj"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Duke u kyçur...' : 'Kyçu'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 " />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 ">ose</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
              >
                ← Kthehu në faqen kryesore
              </Link>
            </div>
          </div>

          {/* Login help */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800  mb-2">
              Ndihmë për hyrje:
            </h3>
            <div className="text-sm text-blue-700">
              <p>Përdorni email-in dhe fjalëkalimin që ju ka dhënë administratori.</p>
              <p>Nëse keni probleme me hyrjen, kontaktoni administratorin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
