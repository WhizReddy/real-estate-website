// instrumentation.ts - This file is automatically loaded by Next.js before the app starts
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Only apply polyfills during production build to prevent SSR errors
  // Don't pollute development environment with fake browser globals
  if (typeof global !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Define browser globals in Node.js environment for libraries that expect them
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = {
        ...global,
        location: {
          protocol: 'http:',
          host: 'localhost',
          hostname: 'localhost',
          port: '3000',
          pathname: '/',
          search: '',
          hash: '',
          href: 'http://localhost:3000/',
        },
      };
    }
    if (typeof (global as any).document === 'undefined') {
      (global as any).document = {
        createElement: () => ({
          setAttribute: () => {},
          style: {},
          appendChild: () => {},
        }),
        getElementById: () => null,
        getElementsByTagName: () => [],
        getElementsByClassName: () => [],
        querySelector: () => null,
        querySelectorAll: () => [],
        head: { appendChild: () => {}, removeChild: () => {} },
        body: { appendChild: () => {}, removeChild: () => {} },
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
  }
}
