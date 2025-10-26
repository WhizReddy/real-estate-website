'use client';

import type { ReactNode } from 'react';

// Deprecated duplicate. Kept as a no-op to avoid breaking any legacy imports.
export default function MapErrorBoundary({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}