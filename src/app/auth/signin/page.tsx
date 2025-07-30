"use client";

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AccessibleInput from '@/components/AccessibleInput';
import AccessibleButton from '@/components/AccessibleButton';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';
import { trackAuthFlow } from '@/lib/performance-monitor';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const authStartTime = performance.now();

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      trackAuthFlow('signin_attempt', authStartTime);

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      if (result?.ok) {
        // Wait a bit for the session to be properly set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the updated session with retry logic
        let session = null;
        let retries = 0;
        const maxRetries = 3;
        
        while (!session && retries < maxRetries) {
          session = await getSession();
          if (!session) {
            await new Promise(resolve => setTimeout(resolve, 200));
            retries++;
          }
        }
        
        if (!session) {
          setError('Failed to establish session. Please try again.');
          return;
        }
        
        // Determine redirect path based on user role
        const redirectPath = determineRedirectPath(session.user.role);
        
        // Execute redirect with proper error handling
        try {
          router.push(redirectPath);
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
          // Fallback to window.location if router fails
          window.location.href = redirectPath;
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const determineRedirectPath = (userRole: string): string => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return '/admin/dashboard';
      case 'agent':
        return '/admin/dashboard'; // Agents also go to dashboard
      default:
        return '/'; // Regular users go to homepage
    }
  };

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-blue-200">
              Access the admin dashboard
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <AccessibleInput
                id="signin-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="h-5 w-5" />}
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
                placeholder="Enter your email"
              />

              <AccessibleInput
                id="signin-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-5 w-5" />}
                showPasswordToggle
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div>
              <AccessibleButton
                type="submit"
                loading={isLoading}
                loadingText="Signing in..."
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-blue-900 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Sign in
              </AccessibleButton>
            </div>

            <div className="text-center">
              <p className="text-sm text-blue-200">
                Demo credentials: demo@admin.com / demo123
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthErrorBoundary>
  );
}