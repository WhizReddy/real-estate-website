// Fallback data synchronization utilities

export interface FallbackProperty {
  id: string;
  data: any;
  timestamp: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

const FALLBACK_STORAGE_KEY = 'fallback_properties';
const MAX_RETRY_COUNT = 3;

// Get all fallback properties from localStorage
export function getFallbackProperties(): FallbackProperty[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FALLBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading fallback properties:', error);
    return [];
  }
}

// Save property to fallback storage
export function saveFallbackProperty(propertyData: any): string {
  if (typeof window === 'undefined') return '';
  
  const fallbackProperty: FallbackProperty = {
    id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    data: propertyData,
    timestamp: new Date().toISOString(),
    syncStatus: 'pending',
    retryCount: 0,
  };
  
  try {
    const existing = getFallbackProperties();
    const updated = [...existing, fallbackProperty];
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(updated));
    
    console.log('Property saved to fallback storage:', fallbackProperty.id);
    return fallbackProperty.id;
  } catch (error) {
    console.error('Error saving to fallback storage:', error);
    throw new Error('Failed to save to fallback storage');
  }
}

// Update fallback property sync status
export function updateFallbackPropertyStatus(
  id: string, 
  status: 'pending' | 'synced' | 'failed',
  incrementRetry: boolean = false
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getFallbackProperties();
    const updated = existing.map(prop => {
      if (prop.id === id) {
        return {
          ...prop,
          syncStatus: status,
          retryCount: incrementRetry ? prop.retryCount + 1 : prop.retryCount,
        };
      }
      return prop;
    });
    
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating fallback property status:', error);
  }
}

// Remove synced properties from fallback storage
export function cleanupSyncedProperties(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getFallbackProperties();
    const pending = existing.filter(prop => prop.syncStatus !== 'synced');
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(pending));
    
    console.log(`Cleaned up ${existing.length - pending.length} synced properties`);
  } catch (error) {
    console.error('Error cleaning up synced properties:', error);
  }
}

// Sync a single fallback property to the database
export async function syncFallbackProperty(fallbackProperty: FallbackProperty): Promise<boolean> {
  try {
    console.log('Syncing fallback property:', fallbackProperty.id);
    
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fallbackProperty.data),
    });
    
    if (response.ok) {
      updateFallbackPropertyStatus(fallbackProperty.id, 'synced');
      console.log('✅ Fallback property synced successfully:', fallbackProperty.id);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Failed to sync fallback property:', error);
      updateFallbackPropertyStatus(fallbackProperty.id, 'failed', true);
      return false;
    }
  } catch (error) {
    console.error('❌ Error syncing fallback property:', error);
    updateFallbackPropertyStatus(fallbackProperty.id, 'failed', true);
    return false;
  }
}

// Sync all pending fallback properties
export async function syncAllFallbackProperties(): Promise<{
  total: number;
  synced: number;
  failed: number;
  skipped: number;
}> {
  const fallbackProperties = getFallbackProperties();
  const pendingProperties = fallbackProperties.filter(
    prop => prop.syncStatus === 'pending' || 
    (prop.syncStatus === 'failed' && prop.retryCount < MAX_RETRY_COUNT)
  );
  
  console.log(`Starting sync of ${pendingProperties.length} fallback properties`);
  
  let synced = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const property of pendingProperties) {
    // Skip properties that have exceeded retry limit
    if (property.retryCount >= MAX_RETRY_COUNT) {
      skipped++;
      continue;
    }
    
    const success = await syncFallbackProperty(property);
    if (success) {
      synced++;
    } else {
      failed++;
    }
    
    // Small delay between syncs to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Clean up successfully synced properties
  if (synced > 0) {
    cleanupSyncedProperties();
  }
  
  const result = {
    total: pendingProperties.length,
    synced,
    failed,
    skipped,
  };
  
  console.log('Sync completed:', result);
  return result;
}

// Check if database is available for syncing
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/health/database', {
      cache: 'no-store',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'connected';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking database availability:', error);
    return false;
  }
}

// Auto-sync fallback data when database becomes available
export async function autoSyncWhenAvailable(): Promise<void> {
  const fallbackProperties = getFallbackProperties();
  const hasPendingData = fallbackProperties.some(prop => prop.syncStatus === 'pending');
  
  if (!hasPendingData) {
    console.log('No pending fallback data to sync');
    return;
  }
  
  const isAvailable = await isDatabaseAvailable();
  if (isAvailable) {
    console.log('Database is available, starting auto-sync...');
    await syncAllFallbackProperties();
  } else {
    console.log('Database not available, skipping auto-sync');
  }
}

// Get fallback statistics
export function getFallbackStats(): {
  total: number;
  pending: number;
  synced: number;
  failed: number;
  oldestPending: string | null;
} {
  const fallbackProperties = getFallbackProperties();
  
  const pending = fallbackProperties.filter(prop => prop.syncStatus === 'pending');
  const synced = fallbackProperties.filter(prop => prop.syncStatus === 'synced');
  const failed = fallbackProperties.filter(prop => prop.syncStatus === 'failed');
  
  const oldestPending = pending.length > 0 
    ? pending.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0].timestamp
    : null;
  
  return {
    total: fallbackProperties.length,
    pending: pending.length,
    synced: synced.length,
    failed: failed.length,
    oldestPending,
  };
}

// Clear all fallback data (use with caution)
export function clearAllFallbackData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(FALLBACK_STORAGE_KEY);
    console.log('All fallback data cleared');
  } catch (error) {
    console.error('Error clearing fallback data:', error);
  }
}