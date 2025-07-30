'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveButton } from '@/components/ResponsiveForms';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsStandalone(isStandaloneMode || isIOSStandalone);
      setIsInstalled(isStandaloneMode || isIOSStandalone);
    };

    // Check if it's iOS
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(isIOSDevice);
    };

    checkInstallation();
    checkIOS();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not already installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      
      // Show success message
      showInstallSuccessMessage();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const showInstallSuccessMessage = () => {
    // You could implement a toast notification here
    console.log('App installed successfully!');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // iOS install instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Install App</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Install Real Estate Explorer for a better experience:
          </p>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</span>
              <span>Tap the Share button</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">2</span>
              <span>Select &quot;Add to Home Screen&quot;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">3</span>
              <span>Tap &quot;Add&quot; to install</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop install prompt
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {isMobile ? (
                <Smartphone className="h-5 w-5 text-blue-600" />
              ) : (
                <Monitor className="h-5 w-5 text-blue-600" />
              )}
              <h3 className="font-semibold text-gray-900">Install App</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Get the full Real Estate Explorer experience with offline access and faster loading.
          </p>
          
          <div className="flex gap-2">
            <ResponsiveButton
              onClick={handleInstallClick}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Install
            </ResponsiveButton>
            <ResponsiveButton
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Later
            </ResponsiveButton>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <span>✓</span>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span>✓</span>
              <span>Faster loading</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>Home screen access</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook to check PWA installation status
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const checkInstallation = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandaloneMode || isIOSStandalone);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    checkInstallation();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { isInstalled, canInstall };
}

// Component to show PWA status in settings or about page
export function PWAStatus() {
  const { isInstalled, canInstall } = usePWAInstall();
  const { isMobile } = useResponsive();

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        {isMobile ? (
          <Smartphone className="h-5 w-5 text-gray-600" />
        ) : (
          <Monitor className="h-5 w-5 text-gray-600" />
        )}
        <h3 className="font-medium text-gray-900">App Installation</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${
            isInstalled ? 'text-green-600' : 'text-gray-500'
          }`}>
            {isInstalled ? 'Installed' : 'Not Installed'}
          </span>
        </div>
        
        {canInstall && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium text-blue-600">Ready to Install</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Platform:</span>
          <span className="font-medium text-gray-900">
            {isMobile ? 'Mobile' : 'Desktop'}
          </span>
        </div>
      </div>
      
      {isInstalled && (
        <div className="mt-3 text-xs text-green-600 bg-green-50 rounded p-2">
          ✓ You&apos;re using the installed app version with offline capabilities
        </div>
      )}
    </div>
  );
}