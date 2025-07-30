'use client';

// Service Worker registration and PWA utilities

export interface PWAConfig {
  swUrl?: string;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

// Register service worker
export async function registerSW(config: PWAConfig = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  const swUrl = config.swUrl || '/sw.js';

  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    
    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content available, please refresh');
              config.onUpdate?.(registration);
            } else {
              // Content is cached for offline use
              console.log('Content cached for offline use');
              config.onSuccess?.(registration);
            }
          }
        });
      }
    });

    // Check for existing service worker
    if (registration.active) {
      config.onSuccess?.(registration);
    }

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    config.onError?.(error as Error);
  }
}

// Unregister service worker
export async function unregisterSW() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('Service Worker unregistered');
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
}

// Check if app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Check if device supports PWA installation
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get PWA display mode
export function getPWADisplayMode(): string {
  if (typeof window === 'undefined') return 'browser';
  
  const displayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
  
  for (const mode of displayModes) {
    if (window.matchMedia(`(display-mode: ${mode})`).matches) {
      return mode;
    }
  }
  
  return 'browser';
}

// Check online status
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

// Listen for online/offline events
export function onNetworkChange(callback: (isOnline: boolean) => void) {
  if (typeof window === 'undefined') return () => {};
  
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Cache management utilities
export class CacheManager {
  private static readonly CACHE_PREFIX = 'real-estate-';
  
  static async clearCache(cacheName?: string) {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    
    try {
      if (cacheName) {
        await caches.delete(`${this.CACHE_PREFIX}${cacheName}`);
      } else {
        const cacheNames = await caches.keys();
        const realEstateCaches = cacheNames.filter(name => 
          name.startsWith(this.CACHE_PREFIX)
        );
        
        await Promise.all(
          realEstateCaches.map(name => caches.delete(name))
        );
      }
      
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
  
  static async getCacheSize(): Promise<number> {
    if (typeof window === 'undefined' || !('caches' in window)) return 0;
    
    try {
      const cacheNames = await caches.keys();
      const realEstateCaches = cacheNames.filter(name => 
        name.startsWith(this.CACHE_PREFIX)
      );
      
      let totalSize = 0;
      
      for (const cacheName of realEstateCaches) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }
  
  static formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Background sync utilities
export class BackgroundSync {
  static async register(tag: string, data?: any) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await (registration as any).sync.register(tag);
        
        // Store data for sync if provided
        if (data) {
          localStorage.setItem(`sync-${tag}`, JSON.stringify(data));
        }
        
        console.log(`Background sync registered: ${tag}`);
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
  
  static getSyncData(tag: string): any {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(`sync-${tag}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get sync data:', error);
      return null;
    }
  }
  
  static clearSyncData(tag: string) {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(`sync-${tag}`);
  }
}

// Push notification utilities
export class PushNotifications {
  private static readonly VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  static async subscribe(): Promise<PushSubscription | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!('pushManager' in registration)) {
        console.log('Push messaging not supported');
        return null;
      }
      
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY || '')
      });
      
      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
  
  static async unsubscribe(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }
  
  static async getSubscription(): Promise<PushSubscription | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }
  
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// Offline storage utilities
export class OfflineStorage {
  private static readonly STORAGE_PREFIX = 'real-estate-offline-';
  
  static setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now()
      });
      
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, serializedValue);
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }
  
  static getItem(key: string, maxAge?: number): any {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (!item) return null;
      
      const { data, timestamp } = JSON.parse(item);
      
      // Check if data is expired
      if (maxAge && Date.now() - timestamp > maxAge) {
        this.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
  }
  
  static clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    const offlineKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
    
    offlineKeys.forEach(key => localStorage.removeItem(key));
  }
  
  static getStorageSize(): number {
    if (typeof window === 'undefined') return 0;
    
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    const offlineKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
    
    offlineKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    
    return totalSize;
  }
}

// PWA update manager
export class PWAUpdateManager {
  private static updateAvailable = false;
  private static registration: ServiceWorkerRegistration | null = null;
  
  static init(registration: ServiceWorkerRegistration) {
    this.registration = registration;
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });
  }
  
  static isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }
  
  static async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) return;
    
    const newWorker = this.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  }
  
  private static notifyUpdateAvailable() {
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }
}

// Functions are already exported individually above