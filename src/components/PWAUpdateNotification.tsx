'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X, Download } from 'lucide-react';
import { usePWA } from '@/components/PWAProvider';
import { ResponsiveButton } from '@/components/ResponsiveForms';

export default function PWAUpdateNotification() {
  const { updateAvailable, applyUpdate } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      await applyUpdate();
    } catch (error) {
      console.error('Failed to apply update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // Don't show if dismissed or not available
  if (!isVisible || !updateAvailable || sessionStorage.getItem('pwa-update-dismissed')) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <h3 className="font-semibold">Update Available</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors"
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-blue-100 text-sm mb-4">
          A new version of the app is available with improvements and bug fixes.
        </p>
        
        <div className="flex gap-2">
          <ResponsiveButton
            onClick={handleUpdate}
            disabled={isUpdating}
            loading={isUpdating}
            variant="secondary"
            size="sm"
            className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Update Now
              </>
            )}
          </ResponsiveButton>
          
          <ResponsiveButton
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-blue-200 hover:text-white hover:bg-blue-700"
            disabled={isUpdating}
          >
            Later
          </ResponsiveButton>
        </div>
        
        <div className="mt-3 text-xs text-blue-200">
          The app will restart automatically after the update.
        </div>
      </div>
    </div>
  );
}

// Component to show in settings or about page
export function PWAUpdateStatus() {
  const { updateAvailable, applyUpdate } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    setLastChecked(new Date());
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      await applyUpdate();
    } catch (error) {
      console.error('Failed to apply update:', error);
      setIsUpdating(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      // Force service worker to check for updates
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">App Updates</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          updateAvailable 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {updateAvailable ? 'Update Available' : 'Up to Date'}
        </div>
      </div>
      
      <div className="space-y-3">
        {updateAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800 mb-2">
              A new version is available with improvements and bug fixes.
            </p>
            <ResponsiveButton
              onClick={handleUpdate}
              disabled={isUpdating}
              loading={isUpdating}
              variant="primary"
              size="sm"
            >
              {isUpdating ? 'Updating...' : 'Update Now'}
            </ResponsiveButton>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last checked:</span>
          <span className="text-gray-900">
            {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
          </span>
        </div>
        
        <ResponsiveButton
          onClick={checkForUpdates}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Check for Updates
        </ResponsiveButton>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Updates are checked automatically when you open the app.
      </div>
    </div>
  );
}