/**
 * Client-side authentication utilities
 */

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
}

/**
 * Get current user data from localStorage
 */
export function getCurrentUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    return JSON.parse(userData) as UserData;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}

/**
 * Check if current user is agent
 */
export function isAgent(): boolean {
  const user = getCurrentUser();
  return user?.role === 'AGENT';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const session = localStorage.getItem('adminSession');
  const userData = localStorage.getItem('userData');
  
  return !!(session && userData);
}

/**
 * Get user session token
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('adminSession');
}

/**
 * Clear user session
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('adminSession');
  localStorage.removeItem('userData');
  
  // Clear cookies
  document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}