import type { Metadata } from "next";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import ResourcePreloader from "@/components/ResourcePreloader";
import { ToastProvider } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAProvider from "@/components/PWAProvider";
import PWAUpdateNotification from "@/components/PWAUpdateNotification";
import { initializeErrorHandler } from "@/lib/errorHandler";
import "./globals.css";

// Initialize global error handler
if (typeof window !== 'undefined') {
  initializeErrorHandler();
}

export const metadata: Metadata = {
  title: {
    default: "Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave",
    template: "%s | Pasuritë e Tiranës"
  },
  description: "Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri. Gjeni shtëpi, apartamente dhe pasuri komerciale me çmime konkurruese.",
  keywords: [
    "pasuri të patundshme",
    "shtëpi për shitje",
    "apartamente me qira",
    "Tiranë",
    "Shqipëri",
    "real estate",
    "property",
    "agjent pasurie",
    "blerje shtëpi",
    "qira apartament"
  ],
  authors: [{ name: "Pasuritë e Tiranës" }],
  creator: "Pasuritë e Tiranës",
  publisher: "Pasuritë e Tiranës",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pasurite-tiranes.al'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'sq_AL',
    url: 'https://pasurite-tiranes.al',
    title: 'Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave',
    description: 'Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri.',
    siteName: 'Pasuritë e Tiranës',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave',
    description: 'Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri.',
    creator: '@pasurite_tiranes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Real Estate Tiranë" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.svg" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.svg" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.svg" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.svg" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.svg" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-128x128.svg" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//tile.openstreetmap.org" />
        
        {/* Performance optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body
        className="font-sans antialiased min-h-dvh flex flex-col overflow-x-hidden"
        suppressHydrationWarning={true}
      >
        <PWAProvider>
          <ToastProvider>
            <PerformanceMonitor />
            <ResourcePreloader />
            <main className="flex-1 min-h-0">
              {children}
            </main>
            <PWAInstallPrompt />
            <PWAUpdateNotification />
          </ToastProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
