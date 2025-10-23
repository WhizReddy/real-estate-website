'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  registerSW, 
  isStandalone, 
  isOnline, 
  onNetworkChange,
  PWAUpdateManager,
  PushNotifications,
  OfflineStorage
} from '@/lib/pwa';

interface PWAContextType {
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  canInstall: boolean;
  applyUpdate: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<PushSubscription | null>;
  unsubscribeFromNotifications: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: ReactNode;
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnlineState, setIsOnlineState] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Initialize PWA functionality
    initializePWA();
  }, []);

  const initializePWA = async () => {
    // Check if app is installed
    setIsInstalled(isStandalone());
    
    // Check initial online status
    setIsOnlineState(isOnline());
    
    // Listen for network changes
    const cleanup = onNetworkChange((online) => {
      setIsOnlineState(online);
      
      if (online) {
        // Sync offline data when back online
        syncOfflineData();
      }
    });

    // UNREGISTER any existing service workers to fix navigation issues
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        
        // Also clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            if (cacheName.includes('real-estate')) {
              await caches.delete(cacheName);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to unregister service workers:', error);
    }

    // Register service worker - TEMPORARILY DISABLED to fix navigation issues
    // TODO: Re-enable after fixing service worker offline redirect logic
    try {
      // Service Worker registration is disabled in development
      // const registration = await registerSW({
      //   onUpdate: (reg) => {
      //     PWAUpdateManager.init(reg);
      //     setUpdateAvailable(true);
      //   },
      //   onSuccess: (reg) => {
      //     PWAUpdateManager.init(reg);
      //     console.log('Service Worker registered successfully');
      //   },
      //   onError: (error) => {
      //     console.error('Service Worker registration failed:', error);
      //   }
      // });

      // if (registration) {
      //   PWAUpdateManager.init(registration);
      // }
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }

    // Listen for install prompt (production only to reduce dev console noise)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Listen for PWA update available
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    // Cleanup function
    return () => {
      cleanup();
      if (process.env.NODE_ENV === 'production') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  };

  const syncOfflineData = async () => {
    try {
      // Sync favorites
      const offlineFavorites = OfflineStorage.getItem('favorites');
      if (offlineFavorites && Array.isArray(offlineFavorites)) {
        for (const favorite of offlineFavorites) {
          try {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(favorite)
            });
          } catch (error) {
            console.error('Failed to sync favorite:', error);
          }
        }
        // Clear synced favorites
        OfflineStorage.removeItem('favorites');
      }

      // Sync inquiries
      const offlineInquiries = OfflineStorage.getItem('inquiries');
      if (offlineInquiries && Array.isArray(offlineInquiries)) {
        for (const inquiry of offlineInquiries) {
          try {
            await fetch('/api/inquiries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(inquiry)
            });
          } catch (error) {
            console.error('Failed to sync inquiry:', error);
          }
        }
        // Clear synced inquiries
        OfflineStorage.removeItem('inquiries');
      }

      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const applyUpdate = async () => {
    try {
      await PWAUpdateManager.applyUpdate();
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Failed to apply update:', error);
    }
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    try {
      return await PushNotifications.requestPermission();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  };

  const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
    try {
      const subscription = await PushNotifications.subscribe();
      
      if (subscription) {
        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      }
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return null;
    }
  };

  const unsubscribeFromNotifications = async (): Promise<boolean> => {
    try {
      const success = await PushNotifications.unsubscribe();
      
      if (success) {
        // Notify server about unsubscription
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      return false;
    }
  };

  const contextValue: PWAContextType = {
    isInstalled,
    isOnline: isOnlineState,
    updateAvailable,
    canInstall,
    applyUpdate,
    requestNotificationPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

// Hook for offline functionality
export function useOffline() {
  const { isOnline } = usePWA();
  
  const saveForLater = (key: string, data: unknown) => {
    if (!isOnline) {
      OfflineStorage.setItem(key, data);
      return true;
    }
    return false;
  };
  
  const getOfflineData = (key: string, maxAge?: number) => {
    return OfflineStorage.getItem(key, maxAge);
  };
  
  const clearOfflineData = (key?: string) => {
    if (key) {
      OfflineStorage.removeItem(key);
    } else {
      OfflineStorage.clear();
    }
  };
  
  return {
    isOnline,
    saveForLater,
    getOfflineData,
    clearOfflineData
  };
}

// Hook for PWA installation
export function usePWAInstall() {
  const { isInstalled, canInstall } = usePWA();
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Installation prompt failed:', error);
      return false;
    }
  };

  return {
    isInstalled,
    canInstall: canInstall && !!deferredPrompt,
    promptInstall
  };
}

// Hook for push notifications
export function usePushNotifications() {
  const { 
    requestNotificationPermission, 
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePWA();
  
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check current subscription
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const currentSubscription = await PushNotifications.getSubscription();
      setSubscription(currentSubscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const requestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async () => {
    const sub = await subscribeToNotifications();
    setSubscription(sub);
    return sub;
  };

  const unsubscribe = async () => {
    const success = await unsubscribeFromNotifications();
    if (success) {
      setSubscription(null);
    }
    return success;
  };

  return {
    permission,
    subscription,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe
  };
}