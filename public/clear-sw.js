// Script to completely clear all service workers and caches
(async function clearAllServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      // Get all registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      console.log(`Found ${registrations.length} service worker registrations`);
      
      // Unregister all service workers
      for (const registration of registrations) {
        console.log('Unregistering service worker:', registration.scope);
        await registration.unregister();
      }
      
      console.log('All service workers unregistered');
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`Found ${cacheNames.length} caches:`, cacheNames);
        
        for (const cacheName of cacheNames) {
          console.log('Deleting cache:', cacheName);
          await caches.delete(cacheName);
        }
        
        console.log('All caches cleared');
      }
      
      // Clear localStorage items related to PWA
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('real-estate') || key.includes('pwa') || key.includes('sw'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      });
      
      console.log('Service workers and caches cleared successfully!');
      alert('Service workers and caches cleared! Please refresh the page.');
      
    } catch (error) {
      console.error('Error clearing service workers:', error);
      alert('Error clearing service workers: ' + error.message);
    }
  } else {
    console.log('Service workers not supported');
    alert('Service workers not supported in this browser');
  }
})();