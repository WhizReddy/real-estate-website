// Polyfill for server-side rendering to support Leaflet and other browser-dependent libraries
// This only runs during production builds to prevent SSR errors
// It must be the very first thing executed before any modules are loaded
(function() {
  // Only apply polyfills during production build, not during development
  if (typeof global !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Polyfill global.self for libraries that expect a browser environment
    if (typeof global.self === 'undefined') {
      global.self = global;
    }
    
    // Polyfill global.window for libraries that expect a browser environment
    if (typeof global.window === 'undefined') {
      global.window = global;
    }
    
    // Polyfill global.document with minimal DOM-like interface
    if (typeof global.document === 'undefined') {
      global.document = {
        createElement: () => ({
          setAttribute: () => {},
          style: {},
          appendChild: () => {},
        }),
        createElementNS: () => ({
          setAttribute: () => {},
          setAttributeNS: () => {},
          style: {},
          appendChild: () => {},
        }),
        getElementById: () => null,
        getElementsByTagName: () => [],
        getElementsByClassName: () => [],
        querySelector: () => null,
        querySelectorAll: () => [],
        head: { 
          appendChild: () => {},
          removeChild: () => {},
        },
        body: {
          appendChild: () => {},
          removeChild: () => {},
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
  }
})();
