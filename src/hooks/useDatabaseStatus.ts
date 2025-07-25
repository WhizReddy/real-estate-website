import { useState, useEffect, useCallback } from 'react';

export interface DatabaseStatus {
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  lastChecked: Date | null;
  responseTime: number | null;
  error: string | null;
  fallbackActive: boolean;
}

export function useDatabaseStatus(checkInterval: number = 30000) {
  const [status, setStatus] = useState<DatabaseStatus>({
    isConnected: false,
    status: 'checking',
    lastChecked: null,
    responseTime: null,
    error: null,
    fallbackActive: false,
  });

  const checkDatabaseHealth = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setStatus(prev => ({ ...prev, status: 'checking' }));
      
      const response = await fetch('/api/health/database', {
        cache: 'no-store',
      });
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      if (response.ok && data.status === 'connected') {
        setStatus({
          isConnected: true,
          status: 'connected',
          lastChecked: new Date(),
          responseTime,
          error: null,
          fallbackActive: false,
        });
      } else {
        setStatus({
          isConnected: false,
          status: 'disconnected',
          lastChecked: new Date(),
          responseTime,
          error: data.error || 'Database connection failed',
          fallbackActive: true,
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setStatus({
        isConnected: false,
        status: 'error',
        lastChecked: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackActive: true,
      });
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkDatabaseHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkDatabaseHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkDatabaseHealth, checkInterval]);

  return {
    status,
    checkDatabaseHealth,
    refresh: checkDatabaseHealth,
  };
}