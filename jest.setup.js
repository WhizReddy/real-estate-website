import '@testing-library/jest-dom'

// Note: Polyfill Request, Response, and TextEncoder which JSDOM strips
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof global.Request === 'undefined') {
  const { Request, Response, fetch, Headers } = require('undici');
  global.Request = Request;
  global.Response = Response;
  global.fetch = fetch;
  global.Headers = Headers;
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.scrollTo and window.alert
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: jest.fn(),
})

Object.defineProperty(window, 'alert', {
  writable: true,
  configurable: true,
  value: jest.fn(),
})

// Mock performance.now
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  }
};

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  configurable: true,
  value: true,
});

Object.defineProperty(navigator, 'connection', {
  writable: true,
  configurable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
  },
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}