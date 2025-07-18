'use client';

import { ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
}

/**
 * A simple wrapper to ensure components are rendered on the client side only
 * This helps prevent hydration mismatches and client component errors
 */
export default function ClientWrapper({ children }: ClientWrapperProps) {
  return <>{children}</>;
}